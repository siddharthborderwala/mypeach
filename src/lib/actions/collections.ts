"use server";

import { db, PrismaError } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { getUserAuth } from "../auth/utils";
import type { FileMetadata } from "./designs";
import { generateId } from "lucia";
import { z } from "zod";
import { formatFlattenedErrors } from "../utils";

export async function getCurrentUserCollectionsList(
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

	const userId = session.user.id;

	const cursor = pagination?.cursor;
	const take = pagination?.take ?? 24;

	const search = options?.search;

	const where: Prisma.CollectionWhereInput = {
		userId,
		name: search
			? {
					contains: search,
					mode: "insensitive",
				}
			: undefined,
	};

	const collections = await db.collection.findMany({
		where,
		orderBy: {
			updatedAt: "desc",
		},
		include: {
			collectionItems: {
				take: 3,
				orderBy: {
					createdAt: "desc",
				},
				include: {
					design: {
						select: {
							id: true,
							thumbnailFileStorageKey: true,
						},
					},
				},
			},
		},
		cursor: cursor ? { id: cursor } : undefined,
		take: take + 1,
	});

	const hasNextPage = collections.length > take;
	const items = collections.slice(0, take);
	const nextCursor = hasNextPage ? items[items.length - 1]?.id : undefined;

	return {
		collections: items,
		pagination: {
			hasNextPage,
			nextCursor,
		},
	};
}

export type UserCollectionsListData = Awaited<
	ReturnType<typeof getCurrentUserCollectionsList>
>;

export type UserCollectionsList = UserCollectionsListData["collections"];

export async function getCollectionById(id: string) {
	const collection = await db.collection.findUnique({
		where: { id },
		include: {
			collectionItems: false,
		},
	});

	return collection;
}

export type CollectionData = Awaited<ReturnType<typeof getCollectionById>>;

export async function getCollectionDesigns(
	collectionId: string,
	pagination?: {
		cursor?: string;
		take?: number;
	},
) {
	const cursor = pagination?.cursor;
	const take = pagination?.take ?? 24;

	const designs = await db.collectionItem.findMany({
		where: { collectionId },
		include: {
			design: {
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
			},
		},
		cursor: cursor
			? {
					collectionId_designId: {
						collectionId,
						designId: cursor,
					},
				}
			: undefined,
		take: take + 1,
		orderBy: {
			createdAt: "desc",
		},
	});

	const hasNextPage = designs.length > take;
	const items = designs.slice(0, take);
	const nextCursor = hasNextPage
		? items[items.length - 1]?.designId
		: undefined;

	return {
		designs: items.map((c) => ({
			...c,
			design: {
				...c.design,
				fileDPI: (c.design.metadata as FileMetadata).fileDPI,
			},
		})),
		pagination: {
			hasNextPage,
			nextCursor,
		},
	};
}

export type CollectionDesignsData = Awaited<
	ReturnType<typeof getCollectionDesigns>
>;

export type CollectionDesign =
	CollectionDesignsData["designs"][number]["design"];

export async function addDesignToCollection(
	designId: string,
	collectionId: string,
) {
	const { session } = await getUserAuth();

	if (!session) {
		redirect("/login");
	}

	const userId = session.user.id;

	try {
		const collectionItem = await db.$transaction(async (tx) => {
			// Check if the collection belongs to the user
			const collection = await tx.collection.findFirst({
				where: {
					id: collectionId,
					userId: userId,
				},
			});

			if (!collection) {
				throw new Error("Collection not found or unauthorized");
			}

			// Check if the design exists
			const design = await tx.design.findUnique({
				where: { id: designId },
			});

			if (!design) {
				throw new Error("Design not found");
			}

			// Add the design to the collection
			const collectionItem = await tx.collectionItem.create({
				data: {
					collectionId,
					designId,
				},
			});

			return {
				...collectionItem,
				collectionName: collection.name,
			};
		});

		return collectionItem;
	} catch (error) {
		if (error instanceof PrismaError) {
			// Handle unique constraint violation
			if (error.code === "P2002") {
				throw new Error("Design is already in the collection");
			}
		}
		throw error;
	}
}

export type AddDesignToCollectionData = Awaited<
	ReturnType<typeof addDesignToCollection>
>;

export async function getCollectionsInWhichDesignIs(designId: string) {
	const { session } = await getUserAuth();

	if (!session) {
		redirect("/login");
	}

	const userId = session.user.id;

	const collections = await db.collectionItem.findMany({
		where: {
			designId,
			collection: {
				userId,
			},
		},
		select: {
			collection: true,
		},
	});

	return collections.map((c) => c.collection);
}

export type CollectionInWhichDesignIsData = Awaited<
	ReturnType<typeof getCollectionsInWhichDesignIs>
>;

const createCollectionSchema = z.object({
	name: z
		.string()
		.min(3, { message: "Name must be at least 3 characters long" }),
	designId: z.string(),
});

export async function createCollection(name: string, designId: string) {
	const { session } = await getUserAuth();

	if (!session) {
		redirect("/login");
	}

	const validatedData = createCollectionSchema.safeParse({
		name,
		designId,
	});

	if (!validatedData.success) {
		throw new Error(formatFlattenedErrors(validatedData.error.flatten()));
	}

	const userId = session.user.id;

	try {
		const collection = await db.collection.create({
			data: {
				id: generateId(24),
				userId,
				name: validatedData.data.name,
				collectionItems: {
					create: {
						designId: validatedData.data.designId,
					},
				},
			},
		});

		return collection;
	} catch (error) {
		if (error instanceof PrismaError) {
			if (error.code === "P2002") {
				throw new Error("Please try again");
			}
		}
		throw error;
	}
}

const removeDesignFromCollectionSchema = z.object({
	designId: z.string(),
	collectionId: z.string(),
});

export async function removeDesignFromCollection(
	designId: string,
	collectionId: string,
) {
	const { session } = await getUserAuth();

	if (!session) {
		redirect("/login");
	}

	const userId = session.user.id;

	const validatedData = removeDesignFromCollectionSchema.safeParse({
		designId,
		collectionId,
	});

	if (!validatedData.success) {
		throw new Error(formatFlattenedErrors(validatedData.error.flatten()));
	}

	// Delete the collection item
	const collectionItem = await db.collectionItem.delete({
		where: {
			collection: {
				userId,
			},
			collectionId_designId: {
				collectionId: validatedData.data.collectionId,
				designId: validatedData.data.designId,
			},
		},
		select: {
			collection: {
				select: {
					name: true,
				},
			},
		},
	});

	return collectionItem.collection;
}

// Update the return type to reflect the possibility of null
export type RemoveDesignFromCollectionResult = Awaited<
	ReturnType<typeof removeDesignFromCollection>
>;

const removeManyDesignsFromCollectionSchema = z.object({
	designIds: z.array(z.string()).min(1),
	collectionId: z.string(),
});

export async function removeManyDesignsFromCollection(
	designIds: string[],
	collectionId: string,
) {
	const { session } = await getUserAuth();

	if (!session) {
		redirect("/login");
	}

	const userId = session.user.id;

	const validatedData = removeManyDesignsFromCollectionSchema.safeParse({
		designIds,
		collectionId,
	});

	if (!validatedData.success) {
		throw new Error(formatFlattenedErrors(validatedData.error.flatten()));
	}

	// Delete multiple collection items
	const result = await db.collectionItem.deleteMany({
		where: {
			collection: {
				userId,
			},
			collectionId: validatedData.data.collectionId,
			designId: {
				in: validatedData.data.designIds,
			},
		},
	});

	// Get the collection name
	const collection = await db.collection.findUnique({
		where: {
			id: validatedData.data.collectionId,
		},
		select: {
			name: true,
		},
	});

	return {
		count: result.count,
		collection,
	};
}

export type RemoveManyDesignsFromCollectionResult = Awaited<
	ReturnType<typeof removeManyDesignsFromCollection>
>;
