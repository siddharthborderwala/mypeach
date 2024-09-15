import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { storage } from "@/lib/storage";
import { getUserAuth } from "@/lib/auth/utils";
import { env } from "@/lib/env.mjs";

export async function POST(request: Request) {
	try {
		const { session } = await getUserAuth();
		if (!session) {
			return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
		}

		const { storageKey, fileType } = await request.json();

		const command = new PutObjectCommand({
			Bucket: env.R2_BUCKET_NAME,
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
