"use server";

import { notFound, redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import Cashfree from "@/lib/payments/cashfree";
import { db } from "@/lib/db";
import { err, ok } from "@/lib/result";
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

	const { designs } = await db.$transaction(async (tx) => {
		const vendor = await tx.vendor.findUnique({
			where: { userId: session.user.id },
		});

		if (!vendor) {
			throw new Error("Vendor not found");
		}

		const where: Prisma.DesignWhereInput = {
			vendorId: vendor.id,
			isSoftDeleted: false,
			OR:
				options?.search || searchTerms
					? [
							{
								name: options?.search
									? {
											contains: options.search,
											mode: "insensitive",
										}
									: undefined,
							},
							{
								tags: searchTerms ? { hasSome: searchTerms } : undefined,
							},
						]
					: undefined,
		};

		const designs = await db.design.findMany({
			where,
			orderBy: { createdAt: "desc" },
			cursor: cursor ? { id: cursor } : undefined,
			take: take + 1,
			include: {
				vendor: {
					include: {
						user: {
							select: {
								id: true,
								username: true,
							},
						},
					},
				},
			},
		});

		return { designs };
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

	const searchTerm = options?.search?.toLowerCase().trim();

	// If we have a search term, we'll use raw SQL for better performance
	if (searchTerm) {
		// biome-ignore lint: reason
		const designs = await db.$queryRaw<any>`
					WITH matched_designs AS (
							SELECT DISTINCT d.*
							FROM "Design" d,
									 unnest(d.tags) tag
							WHERE 
									d."isDraft" = false 
									AND d."isUploadComplete" = true 
									AND d."isSoftDeleted" = false
									AND (
											d.name ILIKE ${`%${searchTerm}%`}
											OR LOWER(tag) LIKE ${`%${searchTerm}%`}
									)
							ORDER BY d."createdAt" DESC
							LIMIT ${take + 1}
							${cursor ? Prisma.sql`OFFSET ${cursor}` : Prisma.sql``}
					)
					SELECT 
							d.*,
							v.*,
							u.id as "userId",
							u.username
					FROM matched_designs d
					LEFT JOIN "Vendor" v ON d."vendorId" = v.id
					LEFT JOIN "User" u ON v."userId" = u.id
			`;

		const hasNextPage = designs.length > take;
		const items = designs.slice(0, take);
		const nextCursor = hasNextPage
			? String(Number(cursor || 0) + take)
			: undefined;

		return {
			// biome-ignore lint: reason
			designs: items.map((d: any) => ({
				id: d.id,
				name: d.name,
				thumbnailFileStorageKey: d.thumbnailFileStorageKey,
				metadata: d.metadata,
				createdAt: d.createdAt,
				price: d.price,
				currency: d.currency,
				tags: d.tags,
				originalFileType: d.originalFileType,
				fileDPI: (d.metadata as FileMetadata).fileDPI,
				vendor: {
					id: d.vendorId,
					user: {
						id: d.userId,
						username: d.username,
					},
				},
			})),
			pagination: {
				hasNextPage,
				nextCursor,
			},
		};
	}

	// For non-search queries, use the regular Prisma query
	const designs = await db.design.findMany({
		where: {
			isDraft: false,
			isUploadComplete: true,
			isSoftDeleted: false,
		},
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
			vendor: {
				include: {
					user: {
						select: {
							id: true,
							username: true,
						},
					},
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
		where: { id, isDraft: false, isUploadComplete: true, isSoftDeleted: false },
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
			vendor: {
				include: {
					user: {
						select: {
							id: true,
							username: true,
						},
					},
				},
			},
		},
	});

	if (!design) {
		notFound();
	}

	return {
		...design,
		fileDPI: (design.metadata as FileMetadata).fileDPI,
	};
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
			include: {
				vendor: {
					include: {
						user: {
							select: {
								id: true,
								username: true,
							},
						},
					},
				},
			},
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
		const [vendor, design] = await db.$transaction([
			db.vendor.findUnique({
				where: { userId: session.user.id },
			}),
			db.design.findUnique({
				where: { id: designId },
			}),
		]);

		if (!vendor) {
			return err("Please create a vendor profile before publishing");
		}

		if (!design) {
			return err("No such design found");
		}

		// user is trying to publish
		if (design.isDraft) {
			if (!design.isUploadComplete) {
				return err("Design upload is not complete");
			}
			if (!design.thumbnailFileStorageKey) {
				return err("Wait for thumbnail to be generated before publishing");
			}
		}

		// user is trying to publish
		if (design.isDraft) {
			// check if vendor is active, if not throw error
			if (vendor.status !== "ACTIVE") {
				const result = await Cashfree.PGESFetchVendors(
					"2023-08-01",
					vendor.id.toString(),
				);
				if (result.data.status !== "ACTIVE") {
					return err(
						"Your vendor account is not active, please reach out to support",
					);
				}
				await db.vendor.update({
					where: { id: vendor.id },
					data: { status: "ACTIVE" },
				});
			}
		}

		const published = await db.design.update({
			where: { id: designId },
			data: { isDraft: !design.isDraft },
			include: {
				vendor: {
					include: {
						user: {
							select: {
								id: true,
								username: true,
							},
						},
					},
				},
			},
		});

		return ok({
			...published,
			metadata: {
				fileDPI: (published.metadata as FileMetadata).fileDPI,
			},
		});
	} catch (error) {
		return err("Something went wrong, please try again");
	}
}

export async function getPurchasedDesigns(pagination?: {
	cursor?: number;
	take?: number;
}) {
	const { session } = await getUserAuth();

	if (!session) {
		redirect("/login");
	}

	const cursor = pagination?.cursor;
	const take = pagination?.take ?? 24;

	const designs = await db.purchasedDesign.findMany({
		where: {
			userId: session.user.id,
		},
		include: {
			design: {
				include: {
					vendor: {
						include: {
							user: {
								select: {
									id: true,
									username: true,
								},
							},
						},
					},
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
			...d.design,
		})),
		pagination: {
			hasNextPage,
			nextCursor,
		},
	};
}
