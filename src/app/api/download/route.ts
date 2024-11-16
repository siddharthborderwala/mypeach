import { getUserAuth } from "@/lib/auth/utils";
import { storage } from "@/lib/storage";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
	try {
		const { session } = await getUserAuth();
		if (!session) {
			return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
		}

		const { fileName } = await request.json();
		if (!fileName) {
			return NextResponse.json(
				{ error: "Missing required field 'fileName'" },
				{ status: 400 },
			);
		}

		const bucketName = process.env.R2_PROTECTED_BUCKET_NAME; // Ensure this is set in your environment variables

		if (!bucketName) {
			throw new Error("Bucket name is not configured");
		}

		// Create the command to get the object
		const command = new GetObjectCommand({
			Bucket: bucketName,
			Key: fileName,
		});

		// Generate a presigned URL valid for 15 minutes
		const signedUrl = await getSignedUrl(storage, command, { expiresIn: 900 }); // 900 seconds = 15 minutes

		return NextResponse.json({ url: signedUrl });
	} catch (error) {
		console.error("Error generating presigned URL:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
