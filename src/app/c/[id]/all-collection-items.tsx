"use client";

import { PaintBrush, ShoppingBag, X } from "@phosphor-icons/react";
import {
	keepPreviousData,
	useInfiniteQuery,
	useMutation,
} from "@tanstack/react-query";
import {
	getCollectionDesigns,
	type CollectionData,
	type CollectionDesignsData,
} from "@/lib/actions/collections";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { InfiniteScrollCollectionItems } from "./infinite-scroll-collection-items";
import { parseAsArrayOf, parseAsString } from "nuqs";
import { useQueryState } from "nuqs";
import { addItemsAction } from "@/lib/actions/cart";
import { toast } from "sonner";
import { queryClient } from "@/app/global-query-client";

export function AllCollectionItems({
	initialData,
	collection,
}: {
	initialData: CollectionDesignsData;
	collection: NonNullable<CollectionData>;
}) {
	const [selectedDesigns, setSelectedDesigns] = useQueryState(
		"selected",
		parseAsArrayOf(parseAsString).withDefault([]),
	);
	const [isSelectDesignsMode, setIsSelectDesignsMode] = useState(() => {
		return selectedDesigns.length > 0;
	});

	const {
		data: allDesigns,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
	} = useInfiniteQuery({
		queryKey: ["collection-designs", collection.id],
		initialPageParam: "",
		queryFn: ({ pageParam = "" }) => {
			return getCollectionDesigns(collection.id, { cursor: pageParam });
		},
		placeholderData: keepPreviousData,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
		initialData: {
			pages: [initialData],
			pageParams: [""],
		},
	});

	const designs = allDesigns.pages
		.flatMap((page) => page.designs)
		.map((d) => d.design);

	const handleSelectAll = useCallback(() => {
		setSelectedDesigns(
			selectedDesigns.length === designs.length
				? null
				: designs.map((design) => design.id),
		);
	}, [designs, selectedDesigns, setSelectedDesigns]);

	const addToCartMutation = useMutation({
		mutationFn: addItemsAction,
		onSuccess: () => {
			toast.success("Designs added to cart");
			setSelectedDesigns(null);
			setIsSelectDesignsMode(false);
		},
		onError: () => {
			toast.error("Failed to add designs to cart");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
		},
	});

	return (
		<main className="relative flex h-[calc(100svh-4.5rem)] flex-col gap-4 md:gap-6">
			<div className="flex items-start justify-between pt-4 px-4 md:pt-8 md:px-8">
				<div className="flex flex-col gap-1">
					<h1 className="text-lg font-semibold md:text-2xl">
						{collection.name}{" "}
						<span className="text-muted-foreground">
							({initialData.designs.length} design
							{initialData.designs.length === 1 ? "" : "s"})
						</span>
					</h1>
					<div>
						<span>by </span>
						<Button variant="link" asChild className="p-0 h-auto">
							<Link href={`/u/${collection.user.username}`}>
								{collection.user.username}
							</Link>
						</Button>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() => {
							setIsSelectDesignsMode((prev) => !prev);
							setSelectedDesigns(null);
						}}
						className="gap-2"
					>
						{isSelectDesignsMode ? <X weight="bold" /> : null}
						{isSelectDesignsMode ? "Cancel" : "Select Designs"}
					</Button>
					{isSelectDesignsMode && (
						<Button variant="outline" onClick={handleSelectAll}>
							{selectedDesigns.length === designs.length
								? "Deselect All"
								: "Select All"}
						</Button>
					)}
					{isSelectDesignsMode && selectedDesigns.length > 0 ? (
						<Button
							variant="default"
							className="gap-2"
							onClick={() => addToCartMutation.mutate(selectedDesigns)}
							disabled={addToCartMutation.isPending}
						>
							<ShoppingBag weight="bold" />
							<span>
								{addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
							</span>
						</Button>
					) : null}
				</div>
			</div>
			{designs.length === 0 ? (
				<div className="mb-4 mx-4 md:mb-8 md:mx-8 flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
					<div className="flex flex-col items-center gap-1 text-center">
						<PaintBrush className="text-muted-foreground" size={48} />
						<h3 className="text-2xl font-bold tracking-tight mt-4">
							No designs in this collection.
						</h3>
					</div>
				</div>
			) : (
				<div className="pb-4 px-4 md:pb-8 md:px-8">
					<InfiniteScrollCollectionItems
						collectionItems={designs}
						fetchNextPage={fetchNextPage}
						hasNextPage={hasNextPage}
						isFetchingNextPage={isFetchingNextPage}
						status={status}
						isSelectDesignsMode={isSelectDesignsMode}
						onDesignToggle={(designId) => {
							setSelectedDesigns((prev) => {
								const newSelectedDesigns = prev.includes(designId)
									? prev.filter((id) => id !== designId)
									: [...prev, designId];
								if (newSelectedDesigns.length === 0) {
									return null;
								}
								return newSelectedDesigns;
							});
						}}
						selectedDesigns={selectedDesigns}
					/>
				</div>
			)}
		</main>
	);
}
