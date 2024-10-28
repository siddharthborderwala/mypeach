"use client";

import { useCallback, useEffect, useState } from "react";
import {
	keepPreviousData,
	useInfiniteQuery,
	useMutation,
	useQuery,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import {
	addDesignToCollection,
	type CollectionInWhichDesignIsData,
	getCollectionsInWhichDesignIs,
	getCurrentUserCollectionsList,
	removeDesignFromCollection,
} from "@/lib/actions/collections";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/spinner";
import { CollectionListItem } from "./collection-list-item";
import { Plus, SmileyXEyes } from "@phosphor-icons/react";
import { toast } from "sonner";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/auth";

export function CollectionsPopover({
	open,
	onOpenChange,
	designToAdd,
	children,
	onCreateNewCollection,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	designToAdd: string;
	onCreateNewCollection: () => void;
	children: ({
		collectionsInWhichDesignIs,
		isCheckingCollectionsInWhichDesignIs,
	}: {
		collectionsInWhichDesignIs: CollectionInWhichDesignIsData | undefined;
		isCheckingCollectionsInWhichDesignIs: boolean;
	}) => JSX.Element;
}) {
	const [search, setSearch] = useState("");
	const cleanSearch = search.trim().toLowerCase();
	const debouncedSearch = useDebounce(cleanSearch, 250);

	const { isLoggedIn } = useAuth();

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isPending,
		status,
		refetch,
	} = useInfiniteQuery({
		queryKey: ["collections", debouncedSearch],
		initialPageParam: "",
		queryFn: ({ pageParam = "" }) => {
			return getCurrentUserCollectionsList(
				{ search: debouncedSearch },
				{ cursor: pageParam },
			);
		},
		placeholderData: keepPreviousData,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
		enabled: isLoggedIn,
	});

	const {
		data: collectionsInWhichDesignIs,
		isPending: isCheckingCollectionsInWhichDesignIs,
		refetch: refetchCollectionsInWhichDesignIs,
	} = useQuery({
		queryKey: ["collections-in-which-design-is", designToAdd],
		queryFn: () => getCollectionsInWhichDesignIs(designToAdd),
		enabled: isLoggedIn,
	});

	const {
		mutate: addDesignToCollectionFn,
		isPending: isAddingDesignToCollection,
	} = useMutation({
		mutationKey: ["add-design-to-collection", designToAdd],
		mutationFn: (collectionId: string) => {
			return addDesignToCollection(designToAdd, collectionId);
		},
		onSuccess: (data) => {
			refetch();
			refetchCollectionsInWhichDesignIs();
			toast.success(`Design added to ${data.collectionName}`);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const {
		mutate: removeDesignFromCollectionFn,
		isPending: isRemovingDesignFromCollection,
	} = useMutation({
		mutationKey: ["remove-design-from-collection", designToAdd],
		mutationFn: (collectionId: string) => {
			return removeDesignFromCollection(designToAdd, collectionId);
		},
		onSuccess: (data) => {
			refetch();
			refetchCollectionsInWhichDesignIs();
			toast.success(`Design removed from ${data.name}`);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const { ref, inView } = useInView();

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const handleCollectionSelect = useCallback(
		(collectionId: string) => {
			try {
				if (collectionsInWhichDesignIs?.some((c) => c.id === collectionId)) {
					removeDesignFromCollectionFn(collectionId);
				} else {
					addDesignToCollectionFn(collectionId);
				}
			} catch (error) {
				console.error(error);
			}
		},
		[
			addDesignToCollectionFn,
			removeDesignFromCollectionFn,
			collectionsInWhichDesignIs,
		],
	);

	const collections = data?.pages.flatMap((page) => page.collections);

	return (
		<Popover modal={true} open={open} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				{children({
					collectionsInWhichDesignIs,
					isCheckingCollectionsInWhichDesignIs,
				})}
			</PopoverTrigger>
			<PopoverContent
				onWheel={(e) => e.preventDefault()}
				className="h-auto py-4 px-0 rounded-xl relative"
			>
				<div>
					<h3 className="font-semibold text-center px-4">Save</h3>
					<div className="px-4 my-3">
						<Input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search collections"
						/>
					</div>
					{status === "error" ? (
						<div className="h-[20rem] flex items-center justify-center px-4">
							<SmileyXEyes className="w-6 h-6" />
							<p className="text-sm">
								Sorry, we couldn't get your collections!
							</p>
						</div>
					) : null}
					{status === "success" ? (
						<ScrollArea className="h-[20rem] px-4 pb-12">
							<div>
								{collections?.map((collection) => (
									<CollectionListItem
										key={collection.id}
										collection={collection}
										onClick={handleCollectionSelect}
										isSelected={
											!!collectionsInWhichDesignIs?.some(
												(c) => c.id === collection.id,
											)
										}
										disabled={
											isAddingDesignToCollection ||
											isRemovingDesignFromCollection
										}
									/>
								))}
								{!isPending && collections && collections.length === 0 ? (
									<div className="flex flex-col items-center justify-center !mt-8 !mb-4 w-full text-sm text-muted-foreground">
										<p className="text-sm text-muted-foreground">
											{search
												? "No collections found"
												: "You don't have any collections yet"}
										</p>
									</div>
								) : null}
								<div
									ref={ref}
									className="flex flex-col items-center justify-center !mt-8 !mb-4 w-full text-sm text-muted-foreground"
								>
									{isFetchingNextPage ? (
										<>
											<Spinner />
											<p>Loading...</p>
										</>
									) : hasNextPage ? null : (
										<>
											{collections && collections.length > 0 ? (
												<p>That's all of the collections</p>
											) : null}
										</>
									)}
								</div>
							</div>
						</ScrollArea>
					) : null}
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="w-full border-t h-16 bg-background absolute bottom-0 left-0 right-0 rounded-b-xl rounded-t-none text-base gap-3 justify-start px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02),0_-2px_4px_-2px_rgba(0,0,0,0.02)]"
					onClick={onCreateNewCollection}
				>
					<span className="w-10 h-10 flex items-center justify-center bg-muted rounded-md">
						<Plus weight="bold" className="w-4 h-4" />
					</span>
					<span>New collection</span>
				</Button>
			</PopoverContent>
		</Popover>
	);
}
