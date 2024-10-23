"use server";

import { db } from "@/lib/db";
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

	const searchTerms = options?.search;

	const where: Prisma.CollectionWhereInput = {
		AND: [
			{
				userId: userId,
			},
			...(searchTerms ? [{ name: { contains: searchTerms } }] : []),
		],
	};

	const collections = await db.collection.findMany({
		where,
		orderBy: {
			createdAt: "desc",
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
	const nextCursor = hasNextPage ? items[items.length - 1].id : undefined;

	return {
		collections: items,
		pagination: {
			hasNextPage,
			nextCursor: nextCursor?.toString(),
		},
	};
}

export type UserCollectionsListData = Awaited<
	ReturnType<typeof getCurrentUserCollectionsList>
>;

export type UserCollectionsList = UserCollectionsListData["collections"];

export async function getCollectionById(id: string) {
	const collection = await db.collection.findUniqueOrThrow({
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
	const nextCursor = hasNextPage ? items[items.length - 1].designId : undefined;

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
