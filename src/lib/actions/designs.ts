"use server";

import { notFound, redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { errAsync, okAsync } from "neverthrow";

import Cashfree from "@/lib/payments/cashfree";
import { db } from "@/lib/db";
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

	const searchTerms = options?.search
		?.split(" ")
		.map((t) => t.trim())
		.filter(Boolean);

	const where: Prisma.DesignWhereInput = {
		isDraft: false,
		isUploadComplete: true,
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
							tags: searchTerms
								? {
										hasSome: searchTerms,
									}
								: undefined,
						},
					]
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
			return errAsync("Please create a vendor profile before publishing");
		}

		if (!design) {
			return errAsync("No such design found");
		}

		// user is trying to publish
		if (design.isDraft) {
			if (!design.isUploadComplete) {
				return errAsync("Design upload is not complete");
			}
			if (!design.thumbnailFileStorageKey) {
				return errAsync("Wait for thumbnail to be generated before publishing");
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
					return errAsync(
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

		return okAsync({
			...published,
			metadata: {
				fileDPI: (published.metadata as FileMetadata).fileDPI,
			},
		});
	} catch (error) {
		return errAsync("Something went wrong, please try again");
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
