import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

import { storage } from "@/lib/storage";
import { getUserAuth } from "@/lib/auth/utils";
import { env } from "@/lib/env.mjs";

const bodyValidator = z.object({
	storageKey: z.string(),
	fileType: z.string(),
	type: z.enum(["public", "protected"]).optional().default("protected"),
});

export async function POST(request: Request) {
	try {
		const { session } = await getUserAuth();
		if (!session) {
			return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
		}

		const result = bodyValidator.safeParse(await request.json());
		if (!result.success) {
			return NextResponse.json(
				{ error: result.error.message },
				{ status: 400 },
			);
		}

		const { storageKey, fileType, type } = result.data;

		const command = new PutObjectCommand({
			Bucket:
				type === "public" ? env.R2_PUBLIC_BUCKET_NAME : env.R2_BUCKET_NAME,
			Key: storageKey,
			ContentType: fileType,
		});

		const presignedUrl = await getSignedUrl(storage, command, {
			expiresIn: 3600,
		});

		return NextResponse.json({ presignedUrl });
	} catch (error) {
		console.error("Error generating presigned URL:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
