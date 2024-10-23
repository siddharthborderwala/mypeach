"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	getCurrentUserCollectionsList,
	type UserCollectionsListData,
} from "@/lib/actions/collections";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import InfiniteScrollCollections from "./infinite-scroll-collections";
import { Bookmark } from "@phosphor-icons/react";

export function AllCollections({
	initialData,
}: {
	initialData: UserCollectionsListData;
}) {
	const [search] = useQueryState("q", parseAsString);

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
		refetch,
	} = useInfiniteQuery({
		queryKey: ["collections"],
		initialPageParam: "",
		queryFn: ({ pageParam = "" }) => {
			return getCurrentUserCollectionsList({ search }, { cursor: pageParam });
		},
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
		initialData: {
			pages: [initialData],
			pageParams: [""],
		},
	});

	const collections = data.pages.flatMap((page) => page.collections);

	return (
		<main className="relative flex h-[calc(100svh-3.5rem)] flex-col gap-4 md:gap-6">
			<div className="flex items-center justify-between pt-4 px-4 md:pt-8 md:px-8">
				<h1 className="text-lg font-semibold md:text-2xl">Your Collections</h1>
			</div>
			{collections.length === 0 ? (
				<div className="mb-4 mx-4 md:mb-8 md:mx-8 flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
					<div className="flex flex-col items-center gap-1 text-center">
						<Bookmark className="text-muted-foreground" size={48} />
						<h3 className="text-2xl font-bold tracking-tight mt-4">
							You have no collections
						</h3>
						<p className="text-sm text-muted-foreground">
							Explore some designs or create a collection from your own designs.
						</p>
						<div className="flex gap-2 mt-4">
							<Button variant="outline" asChild>
								<Link href="/designs">My Designs</Link>
							</Button>
							<Button asChild>
								<Link href="/">Explore</Link>
							</Button>
						</div>
					</div>
				</div>
			) : (
				<ScrollArea>
					<div className="pb-4 px-4 md:pb-8 md:px-8">
						<InfiniteScrollCollections
							collections={collections}
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
