import { InfiniteQueryBottom } from "@/components/infinite-query-bottom";
import { DesignCardView } from "@/components/pages/home/design-card-view";
import type { CollectionDesign } from "@/lib/actions/collections";
import Link from "next/link";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export function InfiniteScrollCollectionItems({
	collectionItems,
	fetchNextPage,
	hasNextPage,
	isFetchingNextPage,
	status,
}: {
	collectionItems: CollectionDesign[];
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
			<div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]">
				{collectionItems.map((design) => (
					<Link
						key={design.id}
						href={`/d/${design.id}`}
						prefetch={false}
						target="_blank"
					>
						<DesignCardView design={design} details="collection-view" />
					</Link>
				))}
			</div>
			<InfiniteQueryBottom
				ref={ref}
				label="designs"
				isFetchingNextPage={isFetchingNextPage}
				hasNextPage={hasNextPage}
			/>
		</>
	);
}
