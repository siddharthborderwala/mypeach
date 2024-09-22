import { GetObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { Readable } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import { task, logger } from "@trigger.dev/sdk/v3";

import { storage } from "@/lib/storage";
import { db } from "@/lib/db";
import { getDesignThumbnailFileStorageKey } from "@/lib/storage/util";
import { env } from "@/lib/env.mjs";

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
): Promise<sharp.Sharp> {
	return sharp()
		.resize({
			width: width,
			fit: "inside",
			withoutEnlargement: true,
		})
		.webp({ quality, effort: 6 })
		.on("error", (error) => {
			logger.error("Error in sharp transform:", { error });
		});
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

async function convertTiffToWebp({
	originalFileStorageKey,
	thumbnailStorageKey,
	width,
	quality,
	sourceBucket,
	destinationBucket,
}: {
	originalFileStorageKey: string;
	thumbnailStorageKey: string;
	width: 2000 | 1200;
	quality: number;
	sourceBucket: string;
	destinationBucket: string;
}): Promise<void> {
	try {
		const readableStream = await getInputStreamFromS3(
			originalFileStorageKey,
			sourceBucket,
		);
		const transform = await createSharpTransform(width, quality);
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
			await convertTiffToWebp({
				originalFileStorageKey: payload.originalFileStorageKey,
				thumbnailStorageKey: thumbnailStorageKey[2000],
				width: 2000,
				quality: 50,
				sourceBucket: env.R2_BUCKET_NAME,
				destinationBucket: env.R2_PUBLIC_BUCKET_NAME,
			});

			// generate 1200w WebP from 2000w WebP
			await convertTiffToWebp({
				originalFileStorageKey: thumbnailStorageKey[2000],
				thumbnailStorageKey: thumbnailStorageKey[1200],
				width: 1200,
				quality: 50,
				sourceBucket: env.R2_PUBLIC_BUCKET_NAME,
				destinationBucket: env.R2_PUBLIC_BUCKET_NAME,
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
