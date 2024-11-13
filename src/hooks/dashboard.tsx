import {
	type DesignData,
	getCurrentUserDesigns,
	getPurchasedDesigns,
} from "@/lib/actions/designs";
import {
	keepPreviousData,
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

export type InfiniteScrollPurchasedDesignsProps = {
	initialData: Awaited<ReturnType<typeof getPurchasedDesigns>>;
};

export function useGetDesigns({
	search,
	initialData,
	trackDesignIdForPreview,
	setTrackDesignIdForPreview,
}: InfiniteScrollDesignsProps & {
	search?: string | null;
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
		queryKey: ["designs", search],
		initialPageParam: "",
		queryFn: async ({ pageParam = "" }) => {
			return getCurrentUserDesigns(
				{
					search,
				},
				{ cursor: pageParam },
			);
		},
		placeholderData: keepPreviousData,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
		initialData: {
			pages: [initialData],
			pageParams: [""],
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
						foundDesign = design as DesignData;
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

export function useGetPurchasedDesigns({
	initialData,
}: InfiniteScrollPurchasedDesignsProps) {
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
		useInfiniteQuery({
			queryKey: ["purchased-designs"],
			initialPageParam: "",
			queryFn: async ({ pageParam = "0" }) => {
				return getPurchasedDesigns({ cursor: Number.parseInt(pageParam) });
			},
			placeholderData: keepPreviousData,
			getNextPageParam: (lastPage) =>
				lastPage.pagination.nextCursor?.toString(),
			initialData: {
				pages: [initialData],
				pageParams: [""],
			},
		});

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

export function useAddDesignToCollection() {
	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: async ({
			designId,
			collections,
		}: { designId: string; collections: string[] }) => {
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
