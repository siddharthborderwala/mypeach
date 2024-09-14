"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ok, err } from "neverthrow";
import { storage } from "@/lib/storage";
import { getUserAuth } from "@/lib/auth/utils";
import { env } from "../env.mjs";

export async function getPresignedUrl({
	fileType,
	fileName,
}: {
	fileType: string;
	fileName: string;
}) {
	const { session } = await getUserAuth();
	if (!session) return err("Unauthorised");

	const command = new PutObjectCommand({
		Bucket: env.R2_BUCKET_NAME,
		Key: fileName,
		ContentType: fileType,
	});

	const signedUrl = await getSignedUrl(storage, command, {
		expiresIn: 3600, // 1 hour expiration
	});

	return ok({ signedUrl });
}
