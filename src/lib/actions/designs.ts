"use server";

import { notFound, redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { getUserAuth } from "../auth/utils";
import type { Prettify } from "../type-utils";

export async function getCurrentUserDesigns(page = 1, pageSize = 24) {
	const { session } = await getUserAuth();

	if (!session) {
		redirect("/login");
	}

	const skip = (page - 1) * pageSize;

	const [designs, totalCount] = await db.$transaction([
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

	return {
		designs,
		pagination: {
			currentPage: page,
			pageSize,
			totalCount,
			totalPages: Math.ceil(totalCount / pageSize),
		},
	};
}

export type FileMetadata = {
	fileDPI: number;
};

export type DesignData = Prettify<
	Awaited<ReturnType<typeof getCurrentUserDesigns>>["designs"][number] & {
		metadata: FileMetadata;
	}
>;

export async function getDesignsForExplore(
	options?: {
		search?: string | null;
	},
	pagination?: {
		page?: number;
		pageSize?: number;
	},
) {
	const page = pagination?.page ?? 1;
	const pageSize = pagination?.pageSize ?? 24;

	const skip = (page - 1) * pageSize;

	const searchTerms = options?.search
		?.split(" ")
		.map((t) => t.trim())
		.filter(Boolean);

	const where: Prisma.DesignWhereInput = {
		AND: [
			{
				isDraft: false,
				isUploadComplete: true,
			},
			...(searchTerms ? [{ tags: { hasSome: searchTerms } }] : []),
		],
	};

	const [designs, totalCount] = await db.$transaction([
		db.design.findMany({
			where,
			select: {
				id: true,
				name: true,
				thumbnailFileStorageKey: true,
				metadata: true,
				createdAt: true,
				price: true,
				currency: true,
				tags: true,
				originalFileType: true,
				user: {
					select: {
						id: true,
						username: true,
					},
				},
			},
			skip,
			take: pageSize,
			orderBy: {
				createdAt: "desc",
			},
		}),
		db.design.count({
			where,
		}),
	]);

	return {
		designs: designs.map((d) => ({
			...d,
			fileDPI: (d.metadata as FileMetadata).fileDPI,
		})),
		pagination: {
			currentPage: page,
			pageSize,
			totalCount,
			totalPages: Math.ceil(totalCount / pageSize),
		},
	};
}

export async function getDesignByIdForExplore(id: string) {
	const design = await db.design.findFirst({
		where: { id, isDraft: false, isUploadComplete: true },
		select: {
			id: true,
			name: true,
			thumbnailFileStorageKey: true,
			metadata: true,
			createdAt: true,
			price: true,
			currency: true,
			user: {
				select: {
					id: true,
					username: true,
				},
			},
		},
	});

	if (!design) {
		notFound();
	}

	return design;
}

export async function getRelatedDesigns(designId: string, count = 8) {
	// get a list of related designs based on tags
	const relatedDesigns = await db.$transaction(async (tx) => {
		const design = await tx.design.findUniqueOrThrow({
			where: { id: designId },
		});

		return tx.design.findMany({
			where: {
				AND: [
					{
						tags: { hasSome: design.tags },
						isDraft: false,
						isUploadComplete: true,
					},
					{
						id: { not: designId },
					},
				],
			},
			orderBy: {
				createdAt: "desc",
			},
			take: count,
		});
	});

	return relatedDesigns;
}
