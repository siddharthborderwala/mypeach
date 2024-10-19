"use client";

import { useEffect, useMemo } from "react";
import { parseAsString, useQueryState } from "nuqs";

import { getDesignsForExplore } from "@/lib/actions/designs";
import { useInView } from "react-intersection-observer";
import type { InfiniteScrollDesignsProps } from "./types";
import { DesignCard } from "./design-card";
import { useInfiniteQuery } from "@tanstack/react-query";

export const DesignsGrid = ({ initialData }: InfiniteScrollDesignsProps) => {
	const [search] = useQueryState("q", parseAsString);

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: ["designs-for-explore", search],
			initialPageParam: "",
			queryFn: ({ pageParam = "" }) => {
				return getDesignsForExplore({ search }, { cursor: pageParam });
			},
			getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
			initialData: {
				pages: [initialData],
				pageParams: [""],
			},
		});

	const allDesigns = useMemo(() => {
		return data.pages.flatMap((page) => page.designs);
	}, [data.pages]);

	const { ref, inView } = useInView();

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	return (
		<>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{allDesigns.map((design) => (
					<DesignCard key={design.id} design={design} />
				))}
			</div>
			<div
				ref={ref}
				className="flex items-center justify-center mt-24 mb-12 w-full"
			>
				{isFetchingNextPage ? (
					<p className="text-sm text-muted-foreground">
						Loading more designs...
					</p>
				) : hasNextPage ? null : (
					<p className="text-sm text-muted-foreground">
						That's all of the designs
					</p>
				)}
			</div>
		</>
	);
};
