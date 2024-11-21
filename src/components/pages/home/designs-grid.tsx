"use client";

import { useEffect, useMemo } from "react";
import { parseAsString, useQueryState } from "nuqs";

import { getDesignsForExplore } from "@/lib/actions/designs";
import { useInView } from "react-intersection-observer";
import type { InfiniteScrollDesignsProps } from "./types";
import { DesignCard } from "./design-card";
import { useInfiniteQuery } from "@tanstack/react-query";
import { InfiniteQueryBottom } from "@/components/infinite-query-bottom";

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
					<DesignCard
						key={design.id}
						design={design}
						style={{ contentVisibility: "auto" }}
					/>
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
};
