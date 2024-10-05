"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import DesignPreview from "./design-preview";
import type { DesignData } from "@/lib/actions/designs";

export default function InfiniteScrollDesigns({
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
			<div
				ref={ref}
				className="flex items-center justify-center mt-8 mb-4 w-full"
			>
				{isFetchingNextPage ? (
					<p className="text-sm text-muted-foreground">
						Loading more designs...
					</p>
				) : hasNextPage ? null : (
					<p className="text-sm text-muted-foreground">
						That's all of your designs
					</p>
				)}
			</div>
		</>
	);
}
