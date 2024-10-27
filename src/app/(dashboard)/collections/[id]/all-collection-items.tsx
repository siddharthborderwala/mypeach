"use client";

import { PaintBrush } from "@phosphor-icons/react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import {
	getCollectionDesigns,
	type CollectionData,
	type CollectionDesignsData,
} from "@/lib/actions/collections";
import { AddDesigns } from "../add-designs";
import { InfiniteScrollCollectionItems } from "./infinite-scroll-collection-items";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AllCollectionItems({
	initialData,
	collection,
}: {
	initialData: CollectionDesignsData;
	collection: NonNullable<CollectionData>;
}) {
	const collectionId = collection.id;

	const {
		data: allDesigns,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
	} = useInfiniteQuery({
		queryKey: ["collection-designs", collectionId],
		initialPageParam: "",
		queryFn: ({ pageParam = "" }) => {
			return getCollectionDesigns(collectionId, { cursor: pageParam });
		},
		placeholderData: keepPreviousData,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
		initialData: {
			pages: [initialData],
			pageParams: [""],
		},
	});

	const designs = allDesigns.pages
		.flatMap((page) => page.designs)
		.map((d) => d.design);

	return (
		<main className="relative flex h-[calc(100svh-3.5rem)] flex-col gap-4 md:gap-6">
			<div className="pt-4 px-4 md:pt-8 md:px-8">
				<Button variant="link" className="h-auto p-0 text-sm">
					<Link href="/collections">All Collections</Link>
				</Button>
				<h1 className="text-lg font-semibold md:text-2xl">{collection.name}</h1>
			</div>
			{designs.length === 0 ? (
				<div className="mb-4 mx-4 md:mb-8 md:mx-8 flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
					<div className="flex flex-col items-center gap-1 text-center">
						<PaintBrush className="text-muted-foreground" size={48} />
						<h3 className="text-2xl font-bold tracking-tight mt-4">
							You have no designs in this collection.
						</h3>
						<p className="text-sm text-muted-foreground">You</p>
						<AddDesigns />
					</div>
				</div>
			) : (
				<ScrollArea>
					<div className="pb-4 px-4 md:pb-8 md:px-8">
						<InfiniteScrollCollectionItems
							collectionItems={designs}
							fetchNextPage={fetchNextPage}
							hasNextPage={hasNextPage}
							isFetchingNextPage={isFetchingNextPage}
							status={status}
						/>
					</div>
				</ScrollArea>
			)}
		</main>
	);
}
