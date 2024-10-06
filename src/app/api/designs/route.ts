import { NextResponse } from "next/server";
import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { getDesignFileStorageKey } from "@/lib/storage/util";
import { z } from "zod";
import type { DesignData } from "@/lib/actions/designs";

const bodyValidator = z.object({
	name: z.string().optional().default("Untitled"),
	designId: z.string().length(24),
	fileId: z.string().length(24),
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

		const { designId, fileId, fileName, fileType } = result.data;

		await db.design.create({
			data: {
				id: designId,
				originalFileStorageKey: getDesignFileStorageKey(fileId),
				originalFileName: fileName,
				originalFileType: fileType,
				userId,
			},
		});

		// await checkDesignUploadAfterADayTask.trigger({
		// 	designId,
		// 	userId,
		// });

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
	designId: z.string().length(24),
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
			typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : tags;

		const dbResult = await db.design.update({
			where: { id: designId, userId: session.user.id },
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

	const [designs, totalCount] = await Promise.all([
		db.design.findMany({
			where: {
				userId: session.user.id,
			},
			orderBy: {
				createdAt: "desc",
			},
			skip,
			take: pageSize,
		}),
		db.design.count({
			where: {
				userId: session.user.id,
			},
		}),
	]);

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

	await db.design.delete({
		where: {
			id: designId,
			userId: session.user.id,
		},
	});

	return NextResponse.json({ success: true });
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
