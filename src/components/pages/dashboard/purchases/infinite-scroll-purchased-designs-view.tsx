"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import DesignPreview from "./purchased-design-preview";
import type { DesignData } from "@/lib/actions/designs";
import { InfiniteQueryBottom } from "@/components/infinite-query-bottom";

export default function InfiniteScrollPurchasedDesigns({
	designs,
	fetchNextPage,
	hasNextPage,
	isFetchingNextPage,
	status,
}: {
	designs: DesignData[];
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

	if (status === "error") return <div>Error loading designs</div>;

	return (
		<>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{designs.map((design) => (
					<DesignPreview key={design.id} design={design} />
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
