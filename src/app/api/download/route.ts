import { z } from "zod";
import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { db } from "@/lib/db";
import { getUserAuth } from "@/lib/auth/utils";
import { storage } from "@/lib/storage";

const schema = z.object({
	designId: z.string(),
});

// download original design file based on designId
export async function PUT(request: Request) {
	try {
		const { session } = await getUserAuth();
		if (!session) {
			return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
		}

		const data = await request.json();
		const result = schema.safeParse(data);

		if (!result.success) {
			return NextResponse.json(
				{ error: "Invalid request body" },
				{ status: 400 },
			);
		}

		const bucketName = process.env.R2_PROTECTED_BUCKET_NAME; // Ensure this is set in your environment variables

		if (!bucketName) {
			throw new Error("Bucket name is not configured");
		}

		const { designId } = result.data;

		const purchasedDesign = await db.purchasedDesign.findFirst({
			where: {
				designId,
				userId: session.user.id,
			},
			orderBy: {
				createdAt: "desc",
			},
			select: {
				design: {
					select: {
						originalFileStorageKey: true,
					},
				},
			},
		});

		if (!purchasedDesign) {
			return NextResponse.json(
				{
					error: "You need to purchase this design to download it",
				},
				{ status: 402 },
			);
		}

		// Create the command to get the object
		const command = new GetObjectCommand({
			Bucket: bucketName,
			Key: purchasedDesign.design.originalFileStorageKey,
		});

		// Generate a presigned URL valid for 5 minutes
		const signedUrl = await getSignedUrl(storage, command, { expiresIn: 300 }); // 300 seconds = 5 minutes

		await db.designDownload.create({
			data: {
				designId,
				userId: session.user.id,
			},
		});

		return NextResponse.json({ url: signedUrl });
	} catch (error) {
		console.error("Error generating presigned URL:", error);
		return NextResponse.json(
			{ error: "Sorry, we could not process your request" },
			{ status: 500 },
		);
	}
}
