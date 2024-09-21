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
): Promise<Readable> {
	logger.info("Fetching object from S3", { originalFileStorageKey });
	const getObjectCommand = new GetObjectCommand({
		Key: originalFileStorageKey,
		Bucket: env.R2_BUCKET_NAME,
	});

	const inputS3Stream = await storage.send(getObjectCommand);
	logger.info("Successfully fetched object from S3");

	if (!inputS3Stream.Body) {
		throw new Error("Input S3 stream is empty");
	}

	logger.info("Converting S3 Body to Node.js Readable stream");
	return Readable.fromWeb(
		// @ts-expect-error
		inputS3Stream.Body.transformToWebStream(),
	);
}

async function createSharpTransform(
	width: number,
	quality: number,
): Promise<sharp.Sharp> {
	logger.info(`Creating sharp transform for ${width}w WebP conversion`);
	return sharp()
		.resize({
			width: width,
			fit: "inside",
			withoutEnlargement: true,
		})
		.webp({ quality, effort: 6 })
		.on("error", (error) => {
			logger.error("Error in sharp transform:", { error });
		})
		.on("info", (info) => {
			logger.info("Sharp transform info:", {
				width: info.width,
				height: info.height,
				size: info.size,
			});
		});
}

async function uploadToS3(
	readableStream: Readable,
	transform: sharp.Sharp,
	key: string,
): Promise<void> {
	logger.info("Initiating upload to S3", { thumbnailStorageKey: key });
	const upload = new Upload({
		client: storage,
		params: {
			Bucket: env.R2_BUCKET_NAME,
			Key: key,
			Body: readableStream.pipe(transform),
			ContentType: "image/webp",
			ACL: "public-read",
		},
	});

	logger.info("Waiting for upload to complete");
	await upload.done();
	logger.info("Upload to S3 completed");
}

async function convertTiffToWebp({
	originalFileStorageKey,
	thumbnailStorageKey,
	width,
	quality,
}: {
	originalFileStorageKey: string;
	thumbnailStorageKey: string;
	width: 2000 | 1200;
	quality: number;
}): Promise<void> {
	logger.info(`Starting conversion for ${width}w`);

	try {
		const readableStream = await getInputStreamFromS3(originalFileStorageKey);
		const transform = await createSharpTransform(width, quality);
		await uploadToS3(readableStream, transform, thumbnailStorageKey);

		logger.info(`Completed conversion for ${width}w`);
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
	logger.info("Updating design record in database", { designId });
	await db.design.update({
		where: { id: designId },
		data: {
			thumbnailFileStorageKey: thumbnailStorageKey,
			thumbnailFileType: "image/webp",
		},
	});
	logger.info("Successfully updated design record");
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
			logger.info("Starting TIFF to WebP conversions");

			// Generate 2000w WebP
			await convertTiffToWebp({
				originalFileStorageKey: payload.originalFileStorageKey,
				thumbnailStorageKey: thumbnailStorageKey[2000],
				width: 2000,
				quality: 50,
			});

			// generate 1200w WebP from 2000w WebP
			await convertTiffToWebp({
				originalFileStorageKey: thumbnailStorageKey[2000],
				thumbnailStorageKey: thumbnailStorageKey[1200],
				width: 1200,
				quality: 50,
			});

			logger.info("Successfully converted TIFF to WebP for both sizes");

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
