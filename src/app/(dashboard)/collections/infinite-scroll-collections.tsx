"use client";

import type { UserCollectionsList } from "@/lib/actions/collections";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { CollectionPreview } from "./collection-preview";
import { InfiniteQueryBottom } from "@/components/infinite-query-bottom";

export default function InfiniteScrollCollections({
	collections,
	fetchNextPage,
	hasNextPage,
	isFetchingNextPage,
	status,
}: {
	collections: UserCollectionsList;
	fetchNextPage: () => void;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	status: string;
}) {
	const { ref, inView } = useInView();

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	if (status === "error") return <div>Error loading collections</div>;

	return (
		<>
			<div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(18rem,1fr))]">
				{collections.map((collection) => (
					<CollectionPreview key={collection.id} collection={collection} />
				))}
			</div>
			<InfiniteQueryBottom
				ref={ref}
				label="collections"
				isFetchingNextPage={isFetchingNextPage}
				hasNextPage={hasNextPage}
			/>
		</>
	);
}
