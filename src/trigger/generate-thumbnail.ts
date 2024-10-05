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
		2000: `design-thumbnails/${id}/2000.webp`,
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
		const repetitions = 5; // Set the desired number of repetitions

		// Generate the watermark SVG
		const svgBuffer = generateWatermarkSVG(
			width,
			width, // If your images are not square, adjust this
			watermarkText,
			repetitions,
		);

		// Composite the watermark SVG over the image
		transform = transform.composite([
			{
				input: svgBuffer,
				blend: "over",
			},
		]);
	}

	return transform.on("error", (error: unknown) => {
		console.error("Error in sharp transform:", { error });
		throw error;
	});
}

function generateWatermarkSVG(
	width: number,
	height: number,
	text: string,
	repetitions: number,
): Buffer {
	const xmlns = "http://www.w3.org/2000/svg";

	// Calculate pattern dimensions based on the number of repetitions
	const patternWidth = width / repetitions;
	const patternHeight = patternWidth; // Assuming square patterns

	// Center positions for the rotated text
	const centerX = patternWidth / 2;
	const centerY = patternHeight / 2;

	// Adjust font size
	const fontSize = patternWidth * 0.25; // Increase multiplier to increase font size

	// Create the SVG content
	const svgContent = `
<svg xmlns="${xmlns}" width="${width}" height="${height}">
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
  <rect width="100%" height="100%" fill="url(#watermarkPattern)" />
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
	width: 2000 | 1200;
	quality: number;
	sourceBucket: string;
	destinationBucket: string;
	addWatermark: boolean;
}): Promise<void> {
	try {
		const readableStream = await getInputStreamFromS3(
			originalFileStorageKey,
			sourceBucket,
		);
		const transform = await createSharpTransform(width, quality, addWatermark);
		await uploadToPublicBucket(
			readableStream,
			transform,
			thumbnailStorageKey,
			destinationBucket,
		);
	} catch (error) {
		logger.error(`Error in convertTiffToWebp for ${width}w:`, {
			error,
			originalFileStorageKey,
			thumbnailStorageKey,
		});
		throw error;
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
	queue: {
		name: "generate-thumbnail-queue",
		concurrencyLimit: 9,
	},
	run: async (payload: {
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
			// Generate 2000w WebP
			await convertToWebp({
				originalFileStorageKey: payload.originalFileStorageKey,
				thumbnailStorageKey: thumbnailStorageKey[2000],
				width: 2000,
				quality: 50,
				sourceBucket: process.env.R2_PROTECTED_BUCKET_NAME!,
				destinationBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
				addWatermark: true,
			});

			// Generate 1200w WebP from 2000w WebP
			const p1 = convertToWebp({
				originalFileStorageKey: thumbnailStorageKey[2000],
				thumbnailStorageKey: thumbnailStorageKey[1200],
				width: 1200,
				quality: 50,
				sourceBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
				destinationBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
				addWatermark: false,
			});

			// Generate 1200w JPEG for social sharing from 2000w WebP
			const p2 = convertToJpeg({
				originalFileStorageKey: thumbnailStorageKey[2000],
				thumbnailStorageKey: thumbnailStorageKey.social,
				width: 1200,
				quality: 80,
				sourceBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
				destinationBucket: process.env.R2_PUBLIC_BUCKET_NAME!,
			});

			await Promise.all([p1, p2]);

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
