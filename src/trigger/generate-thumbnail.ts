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
async function convertTiffToWebp({
	originalFileStorageKey,
	thumbnailStorageKey,
	width,
}: {
	originalFileStorageKey: string;
	thumbnailStorageKey: string;
	width: 2000 | 1200;
}) {
	logger.info(`Starting TIFF to WebP conversion for ${width}w`);

	try {
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
		const readableStream = Readable.fromWeb(
			// @ts-expect-error
			inputS3Stream.Body.transformToWebStream(),
		);

		logger.info(`Creating sharp transform for ${width}w WebP conversion`);
		const transform = sharp()
			.resize({
				width: width,
				fit: "inside",
				withoutEnlargement: true,
			})
			.webp({ quality: 50, effort: 6 })
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

		logger.info(`Initiating upload ${width}w to S3`, { thumbnailStorageKey });
		const upload = new Upload({
			client: storage,
			params: {
				Bucket: env.R2_BUCKET_NAME,
				Key: thumbnailStorageKey,
				Body: readableStream.pipe(transform),
				ContentType: "image/webp",
			},
		});

		logger.info(`Waiting for upload ${width}w to complete`);
		await upload.done();
		logger.info(`Upload ${width}w to S3 completed`);
	} catch (error) {
		logger.error(`Error in convertTiffToWebp for ${width}w:`, {
			error,
			originalFileStorageKey,
			thumbnailStorageKey,
		});
		throw error;
	}
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
			await Promise.all([
				convertTiffToWebp({
					originalFileStorageKey: payload.originalFileStorageKey,
					thumbnailStorageKey: thumbnailStorageKey[2000],
					width: 2000,
				}),
				convertTiffToWebp({
					originalFileStorageKey: payload.originalFileStorageKey,
					thumbnailStorageKey: thumbnailStorageKey[1200],
					width: 1200,
				}),
			]);
			logger.info("Successfully converted TIFF to WebP for both sizes");

			logger.info("Updating design record in database", {
				designId: payload.designId,
			});
			await db.design.update({
				where: { id: payload.designId },
				data: {
					thumbnailFileStorageKey: thumbnailStorageKey.folder,
					thumbnailFileType: "image/webp",
				},
			});
			logger.info("Successfully updated design record");

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
