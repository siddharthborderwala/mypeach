"use client";

import {
	CheckCircle,
	Export,
	PaintBrush,
	ShoppingBag,
	X,
} from "@phosphor-icons/react";
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
import { useShareCollection } from "@/hooks/use-share-collection";

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

	const handleShareCollection = useShareCollection(collection.id);

	const allDesignsSelected =
		selectedDesigns.length === allDesigns.pages.flat().length;
	const noDesignsSelected = selectedDesigns.length === 0;

	const Actions = () => {
		return (
			<>
				{isSelectDesignsMode ? null : (
					<Button
						variant="outline"
						onClick={handleShareCollection}
						className="max-sm:h-11 flex-[1]"
					>
						<Export weight="bold" />
						<span>Share</span>
					</Button>
				)}
				<Button
					variant={isSelectDesignsMode ? "outline" : "default"}
					onClick={() => {
						setIsSelectDesignsMode((prev) => !prev);
						setSelectedDesigns(null);
					}}
					className={`${isSelectDesignsMode ? "flex-[1]" : "flex-[2]"} max-sm:h-11`}
				>
					{isSelectDesignsMode ? <X weight="bold" /> : null}
					{isSelectDesignsMode ? null : "Select Designs"}
				</Button>
				{isSelectDesignsMode ? (
					<>
						{selectedDesigns.length === designs.length ? null : (
							<Button
								variant="default"
								onClick={handleSelectAll}
								className="flex-[2] max-sm:h-11"
							>
								Select All
							</Button>
						)}
					</>
				) : null}
				{isSelectDesignsMode && selectedDesigns.length > 0 ? (
					<Button
						variant="default"
						className="flex-[2] max-sm:h-11"
						onClick={() => addToCartMutation.mutate(selectedDesigns)}
						disabled={addToCartMutation.isPending}
					>
						<ShoppingBag weight="bold" />
						<span>
							{addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
						</span>
					</Button>
				) : null}
			</>
		);
	};

	return (
		<main className="relative flex h-[calc(100svh-4.5rem)] flex-col gap-4 md:gap-6">
			<div className="flex items-start justify-between px-4 md:pt-8 md:px-8">
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
						<Button variant="link" asChild className="p-0 !h-auto">
							<Link href={`/u/${collection.user.username}`}>
								{collection.user.username}
							</Link>
						</Button>
					</div>
				</div>
				<div className="sm:hidden fixed flex w-full items-center gap-2 bottom-0 left-0 p-4 border-t bg-background/10 backdrop-blur-sm">
					<Actions />
				</div>
				<div className="hidden sm:flex items-center gap-2">
					<Actions />
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
