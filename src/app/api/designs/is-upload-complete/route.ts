import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { getGenerateThumbnailTask } from "@/trigger/generate-thumbnail";
import { storage } from "@/lib/storage";
import { env } from "@/lib/env.mjs";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { formatFlattenedErrors } from "@/lib/utils";

const putValidator = z.object({
	designId: z.string().length(36),
	isUploadComplete: z.boolean().optional(),
});

// create a POST endpoint
export async function POST(request: Request) {
	try {
		const { session } = await getUserAuth();
		if (!session) {
			return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
		}

		const body = await request.json();

		const result = putValidator.safeParse(body);

		if (!result.success) {
			return NextResponse.json(
				{ error: formatFlattenedErrors(result.error.flatten()) },
				{ status: 400 },
			);
		}

		const { designId, isUploadComplete } = result.data;

		const dbResult = await db.design.update({
			where: { id: designId },
			data: {
				isUploadComplete,
			},
			select: {
				isUploadComplete: true,
				originalFileStorageKey: true,
			},
		});

		if (dbResult.isUploadComplete) {
			// get the file size of the original file
			const result = await storage.send(
				new HeadObjectCommand({
					Bucket: env.R2_PROTECTED_BUCKET_NAME,
					Key: dbResult.originalFileStorageKey,
				}),
			);

			if (!result.ContentLength) {
				return NextResponse.json(
					{
						error:
							"Unable to determine file size. Please refresh and try uploading again.",
					},
					{ status: 400 },
				);
			}

			await db.design.update({
				where: { id: designId },
				data: {
					originalFileSizeBytes: result.ContentLength,
				},
			});

			const task = getGenerateThumbnailTask(result.ContentLength);

			if (task) {
				await task.trigger({
					designId,
					originalFileStorageKey: dbResult.originalFileStorageKey,
				});
			} else {
				console.log(
					"Generated thumbnail task not triggered as file size is too big > 2400MB",
				);
			}
		}

		return NextResponse.json({ design: dbResult });
	} catch (error) {
		console.error("Could not update design", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
