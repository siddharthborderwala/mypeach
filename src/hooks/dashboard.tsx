import type { InfiniteDesignsResponse } from "@/app/api/designs/route";
import type { DesignData, getCurrentUserDesigns } from "@/lib/actions/designs";
import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";

export function useRefetchDesigns() {
	const queryClient = useQueryClient();

	const refetchDesigns = () => {
		queryClient.invalidateQueries({ queryKey: ["designs"] });
	};

	return refetchDesigns;
}

export type InfiniteScrollDesignsProps = {
	initialData: Awaited<ReturnType<typeof getCurrentUserDesigns>>;
};

export function useGetDesigns({
	initialData,
	trackDesignIdForPreview,
	setTrackDesignIdForPreview,
}: InfiniteScrollDesignsProps & {
	trackDesignIdForPreview: string | undefined;
	setTrackDesignIdForPreview: React.Dispatch<
		React.SetStateAction<string | undefined>
	>;
}) {
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
		refetch,
	} = useInfiniteQuery({
		queryKey: ["designs"],
		initialPageParam: 1,
		queryFn: async ({ pageParam = 1 }) => {
			const res = await fetch(`/api/designs?page=${pageParam}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
			if (!res.ok) {
				throw new Error("Failed to fetch designs");
			}

			const data: InfiniteDesignsResponse = await res.json();
			return data;
		},
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
		if (trackDesignIdForPreview && data) {
			const designId = trackDesignIdForPreview;

			// Find the design with the matching designId
			const pages = data.pages || [];

			let foundDesign: DesignData | undefined;

			outer: for (const page of pages) {
				for (const design of page.designs || []) {
					if (design.id === designId) {
						foundDesign = design;
						break outer;
					}
				}
			}

			if (foundDesign) {
				if (foundDesign.thumbnailFileStorageKey) {
					// Thumbnail is available, stop tracking
					setTrackDesignIdForPreview(undefined);
				} else {
					// Thumbnail not available, refetch after 5 seconds
					const intervalId = setInterval(() => {
						refetch();
					}, 5000);

					// Clear interval when the component unmounts or dependencies change
					return () => clearInterval(intervalId);
				}
			}
		}
	}, [data, trackDesignIdForPreview, refetch, setTrackDesignIdForPreview]);

	return { data, fetchNextPage, hasNextPage, isFetchingNextPage, status };
}

export function useDeleteDesign() {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: async ({ designId }: { designId: string }) => {
			const res = await fetch("/api/designs", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ designId }),
			});
			if (!res.ok) {
				throw new Error("Failed to delete design");
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["designs"] });
		},
	});

	return { mutate, isPending };
}
