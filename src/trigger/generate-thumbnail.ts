import { GetObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { Readable } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import { task, logger } from "@trigger.dev/sdk/v3";

import { db } from "@/lib/db";
import { storage } from "./util/storage";

sharp.cache(false);
sharp.concurrency(1);

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const CHUNK_SIZE = 64 * 1024 * 1024; // 64MB chunks for multipart upload

// Enhanced file size checking
async function checkFileSize(bucket: string, key: string): Promise<void> {
	const command = new GetObjectCommand({
		Bucket: bucket,
		Key: key,
	});

	try {
		const response = await storage.send(command);
		const size = response.ContentLength || 0;

		if (size > MAX_FILE_SIZE) {
			throw new Error(
				`File size ${size} bytes exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`,
			);
		}

		if (size === 0) {
			throw new Error("File is empty");
		}

		logger.info("File size check passed:", {
			size,
			sizeInMB: Math.round((size / (1024 * 1024)) * 100) / 100,
		});
	} catch (error) {
		logger.error("File size check failed:", { error, bucket, key });
		throw error;
	}
}

export function getDesignThumbnailFileStorageKey(id: string) {
	return {
		folder: `design-thumbnails/${id}`,
		social: `design-thumbnails/${id}/social.jpeg`,
		600: `design-thumbnails/${id}/600.webp`,
		1200: `design-thumbnails/${id}/1200.webp`,
	};
}

// Function to convert TIFF from S3 to WebP and save it back to S3
async function getInputStreamFromS3(
	originalFileStorageKey: string,
	bucket: string,
): Promise<Readable> {
	const getObjectCommand = new GetObjectCommand({
		Key: originalFileStorageKey,
		Bucket: bucket,
	});

	const inputS3Stream = await storage.send(getObjectCommand);

	if (!inputS3Stream.Body) {
		throw new Error("Empty body");
	}

	return Readable.fromWeb(
		// @ts-expect-error
		inputS3Stream.Body.transformToWebStream(),
	);
}

// Optimized version of createSharpTransform
async function createSharpTransform(
	width: number,
	quality: number,
	addWatermark: boolean,
): Promise<sharp.Sharp> {
	let transform = sharp({
		limitInputPixels: 32000 * 32000, // Support for very large images
		density: 300,
		failOn: "none",
		unlimited: true, // Remove limits on input file size
	})
		.rotate()
		.resize({
			width: width,
			fit: "inside",
			withoutEnlargement: true,
			fastShrinkOnLoad: true,
		})
		.webp({
			quality,
			effort: 6,
			mixed: true,
			force: true, // Ensure WebP output
		});

	if (addWatermark) {
		const watermarkText = "mypeach.in";
		const svgBuffer = generateWatermarkSVG(watermarkText);
		transform = transform.composite([
			{
				input: svgBuffer,
				tile: true,
				blend: "over",
			},
		]);
	}

	return transform
		.on("error", (error: unknown) => {
			logger.error("Error in sharp transform:", { error });
			throw error;
		})
		.on("info", (info) => {
			logger.info("Processing image:", {
				width: info.width,
				height: info.height,
				channels: info.channels,
				size: info.size,
				format: info.format,
			});
		});
}

function generateWatermarkSVG(text: string): Buffer {
	const xmlns = "http://www.w3.org/2000/svg";
	const patternWidth = 200; // Fixed pattern width
	const patternHeight = patternWidth; // Assuming square patterns
	const centerX = patternWidth / 2;
	const centerY = patternHeight / 2;
	const fontSize = patternWidth * 0.25; // Adjust font size as needed

	// Create the SVG content with fixed dimensions
	const svgContent = `
<svg xmlns="${xmlns}" width="${patternWidth}" height="${patternHeight}">
  <defs>
    <pattern id="watermarkPattern" patternUnits="userSpaceOnUse" width="${patternWidth}" height="${patternHeight}">
      <g transform="translate(${centerX}, ${centerY}) rotate(-45)">
        <text x="0" y="0" font-size="${fontSize}" fill="rgba(255,255,255,0.3)"
          text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif">
          ${text}
        </text>
      </g>
    </pattern>
  </defs>
  <rect width="${patternWidth}" height="${patternHeight}" fill="url(#watermarkPattern)" />
</svg>
`;

	return Buffer.from(svgContent);
}

// Enhanced uploadToPublicBucket with better chunking
async function uploadToPublicBucket(
	readableStream: Readable,
	transform: sharp.Sharp,
	key: string,
	bucket: string,
): Promise<void> {
	const upload = new Upload({
		client: storage,
		params: {
			Bucket: bucket,
			Key: key,
			Body: readableStream.pipe(transform),
			ContentType: "image/webp",
			ACL: "public-read",
		},
		queueSize: 4, // Concurrent upload parts
		partSize: CHUNK_SIZE,
		leavePartsOnError: false,
		tags: [{ Key: "source", Value: "image-processing" }], // Optional: Add tags for tracking
	});

	let lastLogged = 0;
	upload.on("httpUploadProgress", (progress) => {
		// Log progress every 10%
		const percentage = Math.round(
			((progress.loaded || 0) / (progress.total || 1)) * 100,
		);
		if (percentage >= lastLogged + 10) {
			lastLogged = percentage;
			logger.info("Upload progress:", {
				loaded: progress.loaded,
				total: progress.total,
				percentage,
				key: key,
			});
		}
	});

	try {
		await upload.done();
	} catch (error) {
		logger.error("Upload failed:", { error, key });
		throw error;
	}
}

// Enhanced convertToWebp with better memory management
async function convertToWebp({
	originalFileStorageKey,
	thumbnailStorageKey,
	width,
	quality,
	sourceBucket,
	destinationBucket,
	addWatermark,
}: {
	originalFileStorageKey: string;
	thumbnailStorageKey: string;
	width: 600 | 1200;
	quality: number;
	sourceBucket: string;
	destinationBucket: string;
	addWatermark: boolean;
}): Promise<void> {
	let transform: sharp.Sharp | undefined;
	let readableStream: Readable | undefined;

	try {
		const startTime = Date.now();
		const startMemory = process.memoryUsage();
		logger.info("Starting conversion:", {
			startMemory: {
				heapUsed: `${Math.round(startMemory.heapUsed / 1024 / 1024)}MB`,
				rss: `${Math.round(startMemory.rss / 1024 / 1024)}MB`,
			},
		});

		readableStream = await getInputStreamFromS3(
			originalFileStorageKey,
			sourceBucket,
		);

		transform = await createSharpTransform(width, quality, addWatermark);
		transform.withMetadata();

		await uploadToPublicBucket(
			readableStream,
			transform,
			thumbnailStorageKey,
			destinationBucket,
		);

		const endTime = Date.now();
		const endMemory = process.memoryUsage();
		logger.info("Conversion complete:", {
			duration: `${(endTime - startTime) / 1000}s`,
			memoryDelta: {
				heapUsed: `${Math.round(
					(endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024,
				)}MB`,
				rss: `${Math.round((endMemory.rss - startMemory.rss) / 1024 / 1024)}MB`,
			},
		});
	} catch (error) {
		logger.error("Error in convertToWebp:", {
			error,
			originalFileStorageKey,
			thumbnailStorageKey,
		});
		throw error;
	} finally {
		if (transform) {
			transform.destroy();
		}
		if (readableStream) {
			readableStream.destroy();
		}

		if (global.gc) {
			global.gc();
		}
	}
}

async function convertToJpeg({
	originalFileStorageKey,
	thumbnailStorageKey,
	width,
	quality,
	sourceBucket,
	destinationBucket,
}: {
	originalFileStorageKey: string;
	thumbnailStorageKey: string;
	width: number;
	quality: number;
	sourceBucket: string;
	destinationBucket: string;
}): Promise<void> {
	try {
		const readableStream = await getInputStreamFromS3(
			originalFileStorageKey,
			sourceBucket,
		);
		const transform = sharp()
			.resize({
				width: width,
				fit: "inside",
				withoutEnlargement: true,
			})
			.jpeg({ quality, progressive: true });
		await uploadToPublicBucket(
			readableStream,
			transform,
			thumbnailStorageKey,
			destinationBucket,
		);
	} catch (error) {
		logger.error(`Error in convertToJpeg for ${width}w:`, {
			error,
			originalFileStorageKey,
			thumbnailStorageKey,
		});
		throw error;
	}
}

async function updateDesignRecord(
	designId: string,
	thumbnailStorageKey: string,
): Promise<void> {
	await db.design.update({
		where: { id: designId },
		data: {
			thumbnailFileStorageKey: thumbnailStorageKey,
			thumbnailFileType: "image/webp",
		},
	});
}

// Updated main task with enhanced error handling
export const generateThumbnailTask = task({
	id: "generate-thumbnail",
	machine: {
		preset: "medium-2x", // Increased machine size for large files
	},
	queue: {
		name: "generate-thumbnail-queue",
		concurrencyLimit: 2, // Reduced concurrency for better stability
	},
	run: async (payload: {
		designId: string;
		originalFileStorageKey: string;
	}) => {
		logger.info("Starting generateThumbnailTask", {
			designId: payload.designId,
			originalFileStorageKey: payload.originalFileStorageKey,
		});

		// Check file size and validity
		await checkFileSize(
			process.env.R2_PROTECTED_BUCKET_NAME!,
			payload.originalFileStorageKey,
		);

		const thumbnailStorageKey = getDesignThumbnailFileStorageKey(
			payload.designId,
		);

		try {
			// Process sequentially with cleanup between steps
			await convertToWebp({
				originalFileStorageKey: payload.originalFileStorageKey,
				thumbnailStorageKey: thumbnailStorageKey[1200],
				width: 1200,
				quality: 50,
				sourceBucket: process.env.R2_PROTECTED_BUCKET_NAME!,
				destinationBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
				addWatermark: true,
			});

			if (global.gc) global.gc();

			await convertToWebp({
				originalFileStorageKey: thumbnailStorageKey[1200],
				thumbnailStorageKey: thumbnailStorageKey[600],
				width: 600,
				quality: 100,
				sourceBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
				destinationBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
				addWatermark: false,
			});

			if (global.gc) global.gc();

			await convertToJpeg({
				originalFileStorageKey: thumbnailStorageKey[1200],
				thumbnailStorageKey: thumbnailStorageKey.social,
				width: 1200,
				quality: 100,
				sourceBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
				destinationBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
			});

			await updateDesignRecord(payload.designId, thumbnailStorageKey.folder);

			logger.info("generateThumbnailTask completed successfully", {
				designId: payload.designId,
			});
		} catch (error) {
			logger.error("Error in generateThumbnailTask:", {
				error,
				designId: payload.designId,
			});
			throw error;
		}
	},
});
