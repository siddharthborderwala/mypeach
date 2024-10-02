"use client";

import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import DesignPreview from "./design-preview";
import { getCurrentUserDesigns } from "@/lib/actions/designs";

type InfiniteScrollDesignsProps = {
	initialData: Awaited<ReturnType<typeof getCurrentUserDesigns>>;
};

export default function InfiniteScrollDesigns({
	initialData,
}: InfiniteScrollDesignsProps) {
	const { ref, inView } = useInView();

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
		useInfiniteQuery({
			queryKey: ["designs"],
			initialPageParam: 1,
			queryFn: ({ pageParam = 1 }) => getCurrentUserDesigns(pageParam),
			getNextPageParam: (lastPage) =>
				lastPage.pagination.currentPage < lastPage.pagination.totalPages
					? lastPage.pagination.currentPage + 1
					: undefined,
			initialData: {
				pages: [initialData],
				pageParams: [1],
			},
		});

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	console.log(inView);

	if (status === "error") return <div>Error loading designs</div>;

	const allDesigns = data.pages.flatMap((page) => page.designs);

	console.log(allDesigns.length);

	return (
		<>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{allDesigns.map((design) => (
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
