import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { Readable, PassThrough } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import { task, logger } from "@trigger.dev/sdk/v3";

import { db } from "@/lib/db";
import { storage } from "./util/storage";
import stripIndent from "strip-indent";

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

async function createSharpTransform(
	width: number,
	quality: number,
	addWatermark: boolean,
): Promise<sharp.Sharp> {
	const MAX_HEIGHT = 10000; // Set a reasonable maximum height

	let transform = sharp({
		limitInputPixels: false, // Disable pixel limit
	})
		.resize({
			width: width,
			height: MAX_HEIGHT, // Constrain height
			fit: "inside",
			withoutEnlargement: true,
		})
		.webp({ quality, effort: 6 });

	if (addWatermark) {
		const watermarkText = "mypeach.in";

		// Generate the watermark SVG with fixed dimensions
		const svgBuffer = generateWatermarkSVG(watermarkText);

		// Composite the watermark SVG over the image with tiling
		transform = transform.composite([
			{
				input: svgBuffer,
				tile: true,
				blend: "over",
			},
		]);
	}

	return transform.on("error", (error: unknown) => {
		logger.error("Error in sharp transform:", { error });
		throw error;
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
	const svgContent = stripIndent(`
  <svg xmlns="${xmlns}" width="${patternWidth}" height="${patternHeight}">
    <defs>
      <pattern id="watermarkPattern" patternUnits="userSpaceOnUse" width="${patternWidth}" height="${patternHeight}">
        <g transform="translate(${centerX}, ${centerY}) rotate(-45)">
          <text x="0" y="0" font-size="${fontSize}" font-weight="bold" fill="rgba(255,255,255,0.3)" text-anchor="middle" dominant-baseline="central" font-family="sans-serif">
            ${text}
          </text>
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#watermarkPattern)" />
  </svg>
  `);

	return Buffer.from(svgContent);
}

async function uploadToPublicBucket(
	readableStream: Readable,
	transform: sharp.Sharp,
	key: string,
	bucket: string,
): Promise<void> {
	logger.info("Uploading to public bucket", {
		key,
		sizeInBytes: (await transform.metadata()).size,
	});

	const upload = new Upload({
		client: storage,
		params: {
			Bucket: bucket,
			Key: key,
			Body: readableStream.pipe(transform),
			ContentType: "image/webp",
			ACL: "public-read",
		},
	});

	upload.on("httpUploadProgress", (progress) => {
		logger.info("Upload progress:", {
			loaded: progress.loaded,
			total: progress.total,
		});
	});

	await upload.done();
}

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
	try {
		const readableStream = await getInputStreamFromS3(
			originalFileStorageKey,
			sourceBucket,
		);
		transform = await createSharpTransform(width, quality, addWatermark);
		await uploadToPublicBucket(
			readableStream,
			transform,
			thumbnailStorageKey,
			destinationBucket,
		);
	} finally {
		if (transform) {
			// Cleanup sharp instance
			transform.destroy();
		}
	}
}

async function getFileSizeInBytes(
	originalFileStorageKey: string,
	bucket: string,
): Promise<number | undefined> {
	const headObject = await storage.send(
		new HeadObjectCommand({
			Key: originalFileStorageKey,
			Bucket: bucket,
		}),
	);

	return headObject.ContentLength;
}

const SIZE_THRESHOLD = 600 * 1024; // 600KB in bytes

async function convertToJpeg({
	originalFileStorageKey,
	thumbnailStorageKey,
	width,
	sourceBucket,
	destinationBucket,
}: {
	originalFileStorageKey: string;
	thumbnailStorageKey: string;
	width: number;
	sourceBucket: string;
	destinationBucket: string;
}): Promise<void> {
	try {
		const fileSize = await getFileSizeInBytes(
			originalFileStorageKey,
			sourceBucket,
		);

		// Calculate quality based on file size
		// 600KB is the maximum target size
		const quality =
			fileSize && fileSize > SIZE_THRESHOLD
				? Math.floor((SIZE_THRESHOLD / (fileSize / 1024)) * 100)
				: 75;

		const readableStream = await getInputStreamFromS3(
			originalFileStorageKey,
			sourceBucket,
		);

		const transform = await sharp()
			.metadata()
			.then((metadata) => {
				const originalWidth = metadata.width || width;
				const originalHeight = metadata.height || width;
				const aspectRatio = originalHeight / originalWidth;
				const maxAspectRatio = 4 / 3; // 4:3 aspect ratio

				// If image is taller than maxAspectRatio, crop it
				if (aspectRatio > maxAspectRatio) {
					const targetHeight = Math.round(width * maxAspectRatio);
					return sharp()
						.resize({
							width: width,
							height: targetHeight,
							fit: "cover",
							position: "top",
						})
						.jpeg({ quality, progressive: true });
				}

				// Otherwise, maintain original aspect ratio
				return sharp()
					.resize({
						width: width,
						fit: "inside",
						withoutEnlargement: true,
					})
					.jpeg({ quality, progressive: true });
			});

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

const run = async (payload: {
	designId: string;
	originalFileStorageKey: string;
}) => {
	logger.info("Starting generateThumbnailTask", {
		designId: payload.designId,
		originalFileStorageKey: payload.originalFileStorageKey,
	});

	const thumbnailStorageKey = getDesignThumbnailFileStorageKey(
		payload.designId,
	);

	try {
		logger.info("Generating 1200w WebP");
		// Generate 1200w WebP
		await convertToWebp({
			originalFileStorageKey: payload.originalFileStorageKey,
			thumbnailStorageKey: thumbnailStorageKey[1200],
			width: 1200,
			quality: 50,
			sourceBucket: process.env.R2_PROTECTED_BUCKET_NAME!,
			destinationBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
			addWatermark: false,
		});

		logger.info("Generating 600w WebP from 1200w WebP");
		// Generate 600w WebP from 1200w WebP
		await convertToWebp({
			originalFileStorageKey: thumbnailStorageKey[1200],
			thumbnailStorageKey: thumbnailStorageKey[600],
			width: 600,
			quality: 100,
			sourceBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
			destinationBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
			addWatermark: false,
		});

		logger.info("Generating 1200w JPEG for social sharing from 1200w WebP");
		// Generate 1200w JPEG for social sharing from 1200w WebP
		await convertToJpeg({
			originalFileStorageKey: thumbnailStorageKey[1200],
			thumbnailStorageKey: thumbnailStorageKey.social,
			width: 1200,
			sourceBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
			destinationBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
		});

		logger.info("Updating design record with thumbnail file storage key");
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
};

export const generateThumbnailTaskSmall = task({
	id: "generate-thumbnail-small",
	machine: {
		preset: "small-2x",
	},
	queue: {
		concurrencyLimit: 4,
	},
	run,
});

export const generateThumbnailTaskMedium1 = task({
	id: "generate-thumbnail-medium-1",
	machine: {
		preset: "medium-1x",
	},
	queue: {
		concurrencyLimit: 3,
	},
	run,
});

export const generateThumbnailTaskMedium2 = task({
	id: "generate-thumbnail-medium-2",
	machine: {
		preset: "medium-2x",
	},
	queue: {
		concurrencyLimit: 2,
	},
	run,
});

export const generateThumbnailTaskLarge1 = task({
	id: "generate-thumbnail-large-1",
	machine: {
		preset: "large-1x",
	},
	queue: {
		concurrencyLimit: 1,
	},
	run,
});

export const generateThumbnailTaskLarge2 = task({
	id: "generate-thumbnail-large-2",
	machine: {
		preset: "large-2x",
	},
	queue: {
		concurrencyLimit: 1,
	},
	run,
});

const oneMB = 1024 * 1024;

function MB(value: number) {
	return value * oneMB;
}

export const getGenerateThumbnailTask = (fileSizeInBytes: number) => {
	// upto 150MB
	if (fileSizeInBytes < MB(150)) {
		return generateThumbnailTaskSmall;
	}
	// upto 400MB
	if (fileSizeInBytes < MB(400)) {
		return generateThumbnailTaskMedium1;
	}
	// upto 800MB
	if (fileSizeInBytes < MB(800)) {
		return generateThumbnailTaskMedium2;
	}
	// upto 1600MB
	if (fileSizeInBytes < MB(1600)) {
		return generateThumbnailTaskLarge1;
	}
	// upto 2400MB
	if (fileSizeInBytes < MB(2400)) {
		return generateThumbnailTaskLarge2;
	}
	// bigger sizes not supported
	throw new Error("File to big to process and generate thumbnail");
};
