"use client";

import { useCallback, useEffect, useState } from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import {
	addDesignToCollection,
	getCurrentUserCollectionsList,
} from "@/lib/actions/collections";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/spinner";
import { CollectionListItem } from "./collection-list-item";
import { SmileyXEyes } from "@phosphor-icons/react";
import { toast } from "sonner";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export function CollectionsPopover({
	open,
	onOpenChange,
	designToAdd,
	children,
}: React.PropsWithChildren<{
	open: boolean;
	onOpenChange: (open: boolean) => void;
	designToAdd: string;
}>) {
	const [search, setSearch] = useState("");
	const cleanSearch = search.trim().toLowerCase();

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
		refetch,
	} = useInfiniteQuery({
		queryKey: ["collections", cleanSearch],
		initialPageParam: "",
		queryFn: ({ pageParam = "" }) => {
			return getCurrentUserCollectionsList(
				{ search: cleanSearch },
				{ cursor: pageParam },
			);
		},
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
	});

	const {
		mutate: addDesignToCollectionFn,
		data: addDesignToCollectionData,
		error: addDesignToCollectionError,
		isPending: isAddingDesignToCollection,
	} = useMutation({
		mutationKey: ["add-design-to-collection", designToAdd],
		mutationFn: (collectionId: string) => {
			return addDesignToCollection(designToAdd, collectionId);
		},
		onSuccess: (data) => {
			refetch();
			toast.success(`Design added to ${data.collectionName}`);
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
				addDesignToCollectionFn(collectionId);
			} catch (error) {
				console.error(error);
			}
		},
		[addDesignToCollectionFn],
	);

	const collections = data?.pages.flatMap((page) => page.collections);

	return (
		<Popover modal={true} open={open} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent className="h-[24rem]">
				<div className="space-y-2">
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search collections"
					/>
					{status === "error" ? (
						<div className="h-[20rem] flex items-center justify-center">
							<SmileyXEyes className="w-6 h-6" />
							<p className="text-sm">
								Sorry, we couldn't get your collections!
							</p>
						</div>
					) : null}
					{status === "success" ? (
						<ScrollArea className="h-[20rem]">
							<div className="space-y-2">
								{collections?.map((collection) => (
									<CollectionListItem
										key={collection.id}
										collection={collection}
										onClick={handleCollectionSelect}
									/>
								))}
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
										<p>That's all of the collections</p>
									)}
								</div>
							</div>
						</ScrollArea>
					) : null}
				</div>
			</PopoverContent>
		</Popover>
	);
}
