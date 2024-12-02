"use client";

import {
	Check,
	Clipboard as ClipboardIcon,
	PaintBrush,
	TrashSimple,
} from "@phosphor-icons/react";
import {
	keepPreviousData,
	useInfiniteQuery,
	useMutation,
	useQuery,
} from "@tanstack/react-query";
import {
	getCollectionDesigns,
	removeManyDesignsFromCollection,
	type CollectionData,
	type CollectionDesignsData,
	toggleCollectionIsPublic,
	getCollectionById,
} from "@/lib/actions/collections";
import { AddDesigns } from "../add-designs";
import { InfiniteScrollCollectionItems } from "./infinite-scroll-collection-items";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Spinner } from "@/components/spinner";
import { queryClient } from "@/app/global-query-client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

function CopyCollectionLinkButton({ collectionId }: { collectionId: string }) {
	const [isCopied, setIsCopied] = useState(false);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(
			`${window.location.origin}/c/${collectionId}`,
		);
		setIsCopied(true);
		setTimeout(() => {
			setIsCopied(false);
		}, 1000);
	}, [collectionId]);

	return (
		<Button
			size="sm"
			className="text-xs font-medium gap-2"
			onClick={handleCopy}
		>
			{isCopied ? <Check weight="bold" /> : <ClipboardIcon weight="bold" />}
			<span>{isCopied ? "Copied!" : "Copy Link"}</span>
		</Button>
	);
}

export function AllCollectionItems({
	initialData,
	collection,
}: {
	initialData: CollectionDesignsData;
	collection: NonNullable<CollectionData>;
}) {
	const collectionId = collection.id;

	const [isSelectDesignsMode, setIsSelectDesignsMode] = useState(false);
	const [selectedDesigns, setSelectedDesigns] = useState<string[]>([]);
	const [isRemoveDesignsDialogOpen, setIsRemoveDesignsDialogOpen] =
		useState(false);

	const { data: collectionData } = useQuery({
		queryKey: ["collection", collectionId],
		queryFn: async () => {
			const collection = await getCollectionById(collectionId);
			if (!collection) {
				throw new Error("Collection not found");
			}
			return collection;
		},
		placeholderData: keepPreviousData,
		initialData: collection,
	});

	const {
		data: allDesigns,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
	} = useInfiniteQuery({
		queryKey: ["collection-designs", collectionId],
		initialPageParam: "",
		queryFn: ({ pageParam = "" }) => {
			return getCollectionDesigns(collectionId, { cursor: pageParam });
		},
		placeholderData: keepPreviousData,
		getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
		initialData: {
			pages: [initialData],
			pageParams: [""],
		},
	});

	const {
		mutate: removeManyDesignsFromCollectionFn,
		isPending: isRemovingDesignsFromCollection,
	} = useMutation({
		mutationKey: ["remove-many-designs-from-collection", collectionId],
		mutationFn: (designIds: string[]) =>
			removeManyDesignsFromCollection(designIds, collectionId),
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: ["collection-designs", collectionId],
			});
			setIsSelectDesignsMode(false);
			setSelectedDesigns([]);
			setIsRemoveDesignsDialogOpen(false);
			toast.success(
				`Removed ${data.count} designs from ${data.collection?.name}`,
			);
		},
		onError: (error) => {
			setIsRemoveDesignsDialogOpen(false);
			toast.error(error.message);
		},
	});

	const { mutate: toggleIsPublic, isPending: isTogglingPublic } = useMutation({
		mutationKey: ["toggle-collection-public", collectionId],
		mutationFn: (isPublic: boolean) =>
			toggleCollectionIsPublic(collectionId, isPublic),
		onSuccess: (data) => {
			toast.success(
				`Collection is now ${data.isPublic ? "public" : "private"}`,
			);
		},
		onError: () => {
			toast.error("Failed to update collection visibility");
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["collection", collectionId],
			});
		},
	});

	const handleRemoveDesigns = useCallback(() => {
		removeManyDesignsFromCollectionFn(selectedDesigns);
	}, [removeManyDesignsFromCollectionFn, selectedDesigns]);

	const designs = allDesigns.pages
		.flatMap((page) => page.designs)
		.map((d) => d.design);

	return (
		<main className="relative flex h-[calc(100svh-3.5rem)] flex-col gap-4 md:gap-6">
			<div className="flex items-center justify-between pt-4 px-4 md:pt-8 md:px-8">
				<div>
					<Button variant="link" className="h-auto p-0 text-sm">
						<Link href="/collections">All Collections</Link>
					</Button>
					<div className="flex items-end gap-4">
						<h1 className="text-lg font-semibold md:text-2xl">
							{collectionData.name}
						</h1>
						<div className="flex items-center space-x-2 mb-1">
							<Switch
								id="public"
								checked={collectionData.isPublic}
								disabled={isTogglingPublic}
								onCheckedChange={(checked) => toggleIsPublic(checked)}
							/>
							<Label htmlFor="public">Public</Label>
						</div>
						{collectionData.isPublic ? (
							<CopyCollectionLinkButton collectionId={collectionId} />
						) : null}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						className="text-sm"
						onClick={() => setIsSelectDesignsMode((prev) => !prev)}
					>
						{isSelectDesignsMode ? "Cancel" : "Select Designs"}
					</Button>
					{isSelectDesignsMode ? (
						<Dialog
							open={isRemoveDesignsDialogOpen}
							onOpenChange={setIsRemoveDesignsDialogOpen}
						>
							<Tooltip>
								<DialogTrigger asChild>
									<TooltipTrigger asChild>
										<Button
											disabled={selectedDesigns.length === 0}
											variant="destructive"
											className="gap-2"
										>
											<TrashSimple weight="bold" className="" />
											<span>Remove</span>
										</Button>
									</TooltipTrigger>
								</DialogTrigger>
								<TooltipContent>
									Remove selected designs from this collection
								</TooltipContent>
							</Tooltip>
							<DialogContent>
								<DialogHeader>Remove Designs</DialogHeader>
								<DialogDescription>
									Are you sure you want to remove the selected designs from this
									collection?
								</DialogDescription>
								<DialogFooter>
									<DialogClose asChild>
										<Button
											variant="outline"
											disabled={isRemovingDesignsFromCollection}
										>
											Cancel
										</Button>
									</DialogClose>
									<Button
										variant="destructive"
										onClick={handleRemoveDesigns}
										disabled={isRemovingDesignsFromCollection}
										className="gap-2"
									>
										{isRemovingDesignsFromCollection ? (
											<>
												<Spinner />
												<span>Remove</span>
											</>
										) : (
											"Remove"
										)}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					) : null}
				</div>
			</div>
			{designs.length === 0 ? (
				<div className="mb-4 mx-4 md:mb-8 md:mx-8 flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
					<div className="flex flex-col items-center gap-1 text-center">
						<PaintBrush className="text-muted-foreground" size={48} />
						<h3 className="text-2xl font-bold tracking-tight mt-4">
							You have no designs in this collection.
						</h3>
						<p className="text-sm text-muted-foreground">You</p>
						<AddDesigns />
					</div>
				</div>
			) : (
				<ScrollArea>
					<div className="pb-4 px-4 md:pb-8 md:px-8">
						<InfiniteScrollCollectionItems
							collectionItems={designs}
							fetchNextPage={fetchNextPage}
							hasNextPage={hasNextPage}
							isFetchingNextPage={isFetchingNextPage}
							status={status}
							isSelectDesignsMode={isSelectDesignsMode}
							onDesignToggle={(designId) => {
								setSelectedDesigns((prev) =>
									prev.includes(designId)
										? prev.filter((id) => id !== designId)
										: [...prev, designId],
								);
							}}
							selectedDesigns={selectedDesigns}
						/>
					</div>
				</ScrollArea>
			)}
		</main>
	);
}
