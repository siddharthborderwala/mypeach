import { db } from "@/lib/db";
import {
	S3Client,
	HeadObjectCommand,
	PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import type { Readable } from "node:stream";

const s3Client = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID!,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
	},
});

const BUCKET_NAME = process.env.R2_PUBLIC_BUCKET_NAME!;
const SIZE_THRESHOLD = 600 * 1024; // 600KB in bytes

async function streamToBuffer(stream: Readable): Promise<Buffer> {
	const chunks: Buffer[] = [];
	return new Promise((resolve, reject) => {
		stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
		stream.on("error", (err) => reject(err));
		stream.on("end", () => resolve(Buffer.concat(chunks)));
	});
}

async function processImage(key: string, size: number) {
	console.log(`Processing ${key} (${Math.round(size / 1024)}KB)`);

	// Get the original image
	const getCommand = new GetObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
	});

	const response = await s3Client.send(getCommand);
	const imageBuffer = await streamToBuffer(response.Body as Readable);

	const quality = Math.floor((600 / (size / 1024)) * 100);

	// Process with sharp
	const optimizedBuffer = await sharp(imageBuffer).jpeg({ quality }).toBuffer();

	// Upload back to S3
	const putCommand = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
		Body: optimizedBuffer,
		ContentType: "image/jpeg",
	});

	await s3Client.send(putCommand);
	console.log(`Optimized ${key}`);
}

async function main() {
	// Get all designs with social thumbnails
	const designs = await db.design.findMany({
		where: {
			thumbnailFileStorageKey: {
				not: null,
			},
		},
		select: {
			id: true,
			thumbnailFileStorageKey: true,
		},
	});

	console.log(`Found ${designs.length} designs with social thumbnails`);

	for (const design of designs) {
		if (!design.thumbnailFileStorageKey) continue;

		const socialImageKey = `${design.thumbnailFileStorageKey}/social.jpeg`;

		try {
			const headCommand = new HeadObjectCommand({
				Bucket: BUCKET_NAME,
				Key: socialImageKey,
			});

			const headObject = await s3Client.send(headCommand);
			const size = headObject.ContentLength || 0;

			console.log(`${design.id}: ${Math.round(size / 1024)} KB`);

			if (size > SIZE_THRESHOLD) {
				await processImage(socialImageKey, size);
			} else {
				console.log(`${design.id}: under threshold`);
			}
		} catch (error) {
			console.error(`Error processing design ${design.id}:`, error);
		}
	}
}

main()
	.catch((error) => {
		console.error("Script failed:", error);
		process.exit(1);
	})
	.finally(async () => {
		await db.$disconnect();
	});
