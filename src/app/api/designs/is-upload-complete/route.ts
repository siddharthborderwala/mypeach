import { NextResponse } from "next/server";
import { z } from "zod";

import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { generateThumbnailTask } from "@/trigger/generate-thumbnail";

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
				{ error: result.error.message },
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
			const res = await generateThumbnailTask.trigger({
				designId,
				originalFileStorageKey: dbResult.originalFileStorageKey,
			});
		}

		return NextResponse.json({ design: dbResult });
	} catch (error) {
		console.error("Error generating presigned URL:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
