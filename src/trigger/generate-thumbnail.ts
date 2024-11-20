import { GetObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { Readable } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import { task, logger } from "@trigger.dev/sdk/v3";

import { db } from "@/lib/db";
import { storage } from "./util/storage";

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
	let transform = sharp()
		.resize({
			width: width,
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

export const generateThumbnailTask = task({
	id: "generate-thumbnail",
	machine: {
		preset: "micro", // Start with the smallest preset
	},
	queue: {
		name: "generate-thumbnail-queue",
		concurrencyLimit: 5,
	},
	retry: {
		maxAttempts: 7,
	},
	run: async (payload: {
		designId: string;
		originalFileStorageKey: string;
		retryCount?: number;
	}) => {
		const presets = [
			"micro",
			"small-1x",
			"small-2x",
			"medium-1x",
			"medium-2x",
			"large-1x",
			"large-2x",
		];

		const currentRetryCount = payload.retryCount || 0;

		logger.info("Starting generateThumbnailTask", {
			designId: payload.designId,
			originalFileStorageKey: payload.originalFileStorageKey,
			retryCount: currentRetryCount,
			preset: presets[currentRetryCount],
		});

		try {
			const thumbnailStorageKey = getDesignThumbnailFileStorageKey(
				payload.designId,
			);

			// Generate 1200w WebP
			await convertToWebp({
				originalFileStorageKey: payload.originalFileStorageKey,
				thumbnailStorageKey: thumbnailStorageKey[1200],
				width: 1200,
				quality: 50,
				sourceBucket: process.env.R2_PROTECTED_BUCKET_NAME!,
				destinationBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
				addWatermark: true,
			});

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

			// Generate 1200w JPEG for social sharing from 1200w WebP
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
				retryCount: currentRetryCount,
			});
		} catch (error) {
			logger.error("Error in generateThumbnailTask:", {
				error,
				designId: payload.designId,
				retryCount: currentRetryCount,
			});

			if (currentRetryCount < presets.length - 1) {
				const retryDelay = 2 ** currentRetryCount * 1000;

				await new Promise((resolve) => setTimeout(resolve, retryDelay));

				await generateThumbnailTask.trigger({
					...payload,
					retryCount: currentRetryCount + 1,
				});

				return;
			}
			throw error;
		}
	},
});
