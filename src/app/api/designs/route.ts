import { NextResponse } from "next/server";
import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { getDesignFileStorageKey } from "@/lib/storage/util";
import { z } from "zod";
import type { DesignData } from "@/lib/actions/designs";
import { checkDesignUploaded } from "@/trigger/check-design-upload-after-a-day";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { storage } from "@/lib/storage";
import { env } from "@/lib/env.mjs";

const bodyValidator = z.object({
	name: z.string().optional().default("Untitled"),
	designId: z.string().length(36),
	fileId: z.string().length(36),
	fileName: z.string(),
	fileType: z.string(),
});

export async function POST(request: Request) {
	try {
		const { session } = await getUserAuth();
		if (!session) {
			return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
		}

		const userId = session.user.id;

		const body = await request.json();

		const result = bodyValidator.safeParse(body);

		if (!result.success) {
			return NextResponse.json(
				{ error: "Invalid request body" },
				{ status: 400 },
			);
		}

		const vendor = await db.vendor.findUnique({
			where: { userId },
		});

		if (!vendor) {
			return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
		}

		const { designId, fileId, fileName, fileType } = result.data;

		await db.design.create({
			data: {
				id: designId,
				originalFileStorageKey: getDesignFileStorageKey(fileId),
				originalFileName: fileName,
				originalFileType: fileType,
				vendorId: vendor.id,
				metadata: {
					fileDPI: 300,
				},
				isDraft: vendor?.status !== "ACTIVE",
			},
		});

		await checkDesignUploaded.trigger(
			{
				designId,
				userId,
			},
			{
				delay: "1d",
			},
		);

		return NextResponse.json({ designId });
	} catch (error) {
		console.error("Error generating presigned URL:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

const putValidator = z.object({
	name: z.string().optional(),
	designId: z.string().length(36),
	isDraft: z.boolean().optional(),
	thumbnailFileStorageKey: z.string().optional(),
	thumbnailFileType: z.string().optional(),
	price: z.number().min(290).optional(),
	tags: z.union([z.string(), z.array(z.string())]),
	fileDPI: z.number().min(72).optional(),
});

// create a PUT endpoint
export async function PUT(request: Request) {
	try {
		const { session } = await getUserAuth();
		if (!session) {
			return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
		}

		const vendor = await db.vendor.findUnique({
			where: { userId: session.user.id },
		});

		if (!vendor) {
			return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
		}

		const body = await request.json();

		const result = putValidator.safeParse(body);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error.message },
				{ status: 400 },
			);
		}

		const { designId, fileDPI, tags, name, ...designData } = result.data;

		const tagsArray =
			typeof tags === "string"
				? tags
						.split(",")
						.map((t) => t.trim())
						.filter((t) => t.length > 0)
				: tags;

		const dbResult = await db.design.update({
			where: { id: designId },
			data: {
				...designData,
				name,
				metadata: {
					fileDPI,
				},
				tags: tagsArray,
			},
		});

		return NextResponse.json({ design: dbResult });
	} catch (error) {
		console.error("Error generating presigned URL:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const pageParam = searchParams.get("page");
	const page = pageParam ? Number(pageParam) : 1;
	const pageSize = 24; // or get from query params if needed

	const { session } = await getUserAuth();

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const skip = (page - 1) * pageSize;

	const { designs, totalCount } = await db.$transaction(async (tx) => {
		const vendor = await tx.vendor.findUnique({
			where: { userId: session.user.id },
		});

		if (!vendor) {
			throw new Error("Vendor not found");
		}

		const [designs, totalCount] = await Promise.all([
			db.design.findMany({
				where: {
					vendorId: vendor.id,
					isSoftDeleted: false,
				},
				orderBy: {
					createdAt: "desc",
				},
				skip,
				take: pageSize,
				include: {
					vendor: {
						include: {
							user: {
								select: {
									id: true,
									username: true,
									email: true,
								},
							},
						},
					},
				},
			}),

			db.design.count({
				where: {
					vendorId: vendor.id,
				},
			}),
		]);

		return { designs, totalCount };
	});

	return NextResponse.json({
		designs,
		pagination: {
			currentPage: page,
			pageSize,
			totalCount,
			totalPages: Math.ceil(totalCount / pageSize),
		},
	});
}

export async function DELETE(request: Request) {
	const { session } = await getUserAuth();

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { designId } = await request.json();

	if (!designId) {
		return NextResponse.json(
			{ error: "Design ID is required" },
			{ status: 400 },
		);
	}

	const vendor = await db.vendor.findUnique({
		where: { userId: session.user.id },
	});

	if (!vendor) {
		return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
	}

	try {
		const result = await db.$transaction(async (tx) => {
			const numberOfSalesForDesign = await tx.sales.count({
				where: {
					designId,
				},
			});

			if (numberOfSalesForDesign > 0) {
				await tx.design.update({
					where: { id: designId },
					data: { isSoftDeleted: true },
				});
				return null;
			}

			return tx.design.delete({
				where: { id: designId },
				select: {
					originalFileStorageKey: true,
					thumbnailFileStorageKey: true,
				},
			});
		});

		if (!result) {
			return NextResponse.json({ success: true });
		}

		const { originalFileStorageKey, thumbnailFileStorageKey } = result;

		await Promise.allSettled([
			storage.send(
				new DeleteObjectCommand({
					Bucket: env.R2_PROTECTED_BUCKET_NAME,
					Key: originalFileStorageKey,
				}),
			),
			thumbnailFileStorageKey
				? storage.send(
						new DeleteObjectCommand({
							Bucket: env.R2_PROTECTED_BUCKET_NAME,
							Key: thumbnailFileStorageKey,
						}),
					)
				: null,
		]);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting design:", error);
		return NextResponse.json(
			{ error: "Sorry, we couldn't delete your design at this time." },
			{ status: 500 },
		);
	}
}

export type InfiniteDesignsResponse = {
	designs: DesignData[];
	pagination: {
		currentPage: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
};
