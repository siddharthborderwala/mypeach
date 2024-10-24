"use server";

import { db, PrismaError } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { getUserAuth } from "../auth/utils";
import type { FileMetadata } from "./designs";

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
		AND: [
			{
				userId: userId,
			},
			...(search ? [{ name: { contains: search } }] : []),
		],
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
