"use server";

import { notFound, redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

import { db, PrismaError, TxError } from "@/lib/db";
import { getUserAuth } from "../auth/utils";
import type { Prettify } from "../type-utils";

export async function getCurrentUserDesigns(
	options?: {
		search?: string | null;
	},
	pagination?: {
		cursor?: string;
		take?: number;
	},
) {
	const { session } = await getUserAuth();

	if (!session) {
		redirect("/login");
	}

	const cursor = pagination?.cursor;
	const take = pagination?.take ?? 24;

	const searchTerms = options?.search
		?.split(" ")
		.map((t) => t.trim())
		.filter(Boolean);

	const where: Prisma.DesignWhereInput = {
		userId: session.user.id,
		name: options?.search
			? {
					contains: options.search,
					mode: "insensitive",
				}
			: undefined,
		tags: searchTerms ? { hasSome: searchTerms } : undefined,
	};

	const designs = await db.design.findMany({
		where,
		orderBy: { createdAt: "desc" },
		cursor: cursor ? { id: cursor } : undefined,
		take: take + 1,
	});

	const hasNextPage = designs.length > take;
	const items = designs.slice(0, take);
	const nextCursor = hasNextPage ? items[items.length - 1]?.id : undefined;

	return {
		designs: items,
		pagination: {
			hasNextPage,
			nextCursor,
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
		cursor?: string;
		take?: number;
	},
) {
	const cursor = pagination?.cursor;
	const take = pagination?.take ?? 24;

	const searchTerms = options?.search
		?.split(" ")
		.map((t) => t.trim())
		.filter(Boolean);

	const where: Prisma.DesignWhereInput = {
		isDraft: false,
		isUploadComplete: true,
		name: options?.search
			? {
					contains: options.search,
					mode: "insensitive",
				}
			: undefined,
		tags: searchTerms
			? {
					hasSome: searchTerms,
				}
			: undefined,
	};

	const designs = await db.design.findMany({
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
		cursor: cursor ? { id: cursor } : undefined,
		take: take + 1,
		orderBy: {
			createdAt: "desc",
		},
	});

	const hasNextPage = designs.length > take;
	const items = designs.slice(0, take);
	const nextCursor = hasNextPage ? items[items.length - 1]?.id : undefined;

	return {
		designs: items.map((d) => ({
			...d,
			fileDPI: (d.metadata as FileMetadata).fileDPI,
		})),
		pagination: {
			hasNextPage,
			nextCursor,
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

export async function toggleDesignPublish(designId: string) {
	const { session } = await getUserAuth();

	if (!session) {
		redirect("/login");
	}

	try {
		const published = await db.$transaction(async (tx) => {
			// check if user has KYC and a vendor
			const user = await tx.user.findUniqueOrThrow({
				where: { id: session.user.id },
				select: {
					vendor: {
						select: {
							id: true,
						},
					},
				},
			});

			// if (!user.vendor) {
			// 	throw new TxError(
			// 		"Please complete your KYC and add banking details to publish designs and start selling",
			// 	);
			// }

			const design = await tx.design.findUniqueOrThrow({
				where: { id: designId },
			});

			return tx.design.update({
				where: { id: designId },
				data: { isDraft: !design.isDraft },
			});
		});

		return {
			...published,
			metadata: {
				fileDPI: (published.metadata as FileMetadata).fileDPI,
			},
		};
	} catch (error) {
		if (error instanceof PrismaError) {
			if (error.code === "P2025") {
				throw new TxError("Design not found");
			}
		}
		if (error instanceof TxError) {
			throw error;
		}
		throw error;
	}
}
