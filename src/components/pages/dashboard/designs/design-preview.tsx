"use client";

import ImageWithFallback from "@/components/image-with-fallback";
import type { DesignData } from "@/lib/actions/designs";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import { parseAsString, useQueryState } from "nuqs";
import { Badge } from "@/components/ui/badge";
import { useUploadContext } from "./upload-context";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { memo, useState, useCallback } from "react";
import { useDeleteDesign } from "@/hooks/dashboard";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { appBaseURL, isMobileUA } from "@/lib/utils";
import {
	CaretDown,
	DotsThreeVertical,
	Export,
	FolderPlus,
	Pencil,
	Trash,
} from "@phosphor-icons/react";
import { CollectionsPopover } from "@/components/collections-popover";
import { NewCollectionModal } from "@/components/new-collection-modal";

function DesignPreview_({
	design,
}: {
	design: DesignData;
}) {
	const [, setDesign] = useQueryState("design", parseAsString);
	const { newDesignId, setEditDesignDetails } = useUploadContext();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showCollectionsPopover, setShowCollectionsPopover] = useState(false);
	const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] =
		useState(false);

	const { mutate, isPending } = useDeleteDesign();

	const handleShare = useCallback(() => {
		const designURL = `${appBaseURL}/d/${design.id}`;
		const isMobile = isMobileUA(navigator.userAgent);

		if (navigator.share && isMobile) {
			navigator
				.share({
					url: designURL,
				})
				.catch(() => {
					navigator.clipboard
						.writeText(designURL)
						.then(() => toast.success("Copied URL"))
						.catch(() => toast.error("Failed to copy URL"));
				});
		} else {
			navigator.clipboard
				.writeText(designURL)
				.then(() => toast.success("Copied URL"))
				.catch(() => toast.error("Failed to copy URL"));
		}
	}, [design.id]);

	return (
		<>
			<div className="border rounded-lg p-4 shadow-sm">
				<ImageWithFallback
					suppressHydrationWarning
					src={getDesignThumbnailURL(design.thumbnailFileStorageKey, 1200)}
					width="100%"
					className="aspect-square rounded flex items-center justify-center select-none pointer-events-none object-cover"
				/>
				<div className="flex mt-2 justify-between">
					<div className="flex flex-col text-left flex-1 max-w-[80%]">
						<p className="font-medium truncate">{design.name}</p>
						<div className="flex items-center justify-between mt-1">
							{newDesignId === design.id ? (
								<Badge>Uploading</Badge>
							) : (
								<Badge variant={design.isDraft ? "warning" : "success"}>
									{design.isDraft ? "Draft" : "Published"}
								</Badge>
							)}
						</div>
					</div>
					<DropdownMenu modal={true}>
						<DropdownMenuTrigger
							asChild
							onClick={(e) => e.stopPropagation()}
							className="mt-1"
						>
							<Button variant="outline" size="sm" className="h-8 w-8 p-0">
								<DotsThreeVertical weight="bold" className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									setDesign(design.id);
									setEditDesignDetails(design);
								}}
							>
								<Pencil className="mr-2 h-4 w-4" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								disabled={isPending || design.isDraft}
								onClick={(e) => {
									e.stopPropagation();
									handleShare();
								}}
							>
								<Export className="mr-2 h-4 w-4" />
								Share URL
							</DropdownMenuItem>
							<CollectionsPopover
								open={showCollectionsPopover}
								onOpenChange={setShowCollectionsPopover}
								designToAdd={design.id}
								onCreateNewCollection={() => {
									setShowCollectionsPopover(false);
									setIsNewCollectionModalOpen(true);
								}}
							>
								{() => (
									<DropdownMenuItem
										disabled={isPending || design.isDraft}
										onClick={(e) => {
											e.stopPropagation();
											setShowCollectionsPopover(true);
											e.preventDefault();
										}}
									>
										<FolderPlus className="mr-2 h-4 w-4" />
										Add to Collection
									</DropdownMenuItem>
								)}
							</CollectionsPopover>
							<DropdownMenuItem
								className="text-destructive"
								onClick={(e) => {
									e.stopPropagation();
									setShowDeleteDialog(true);
								}}
							>
								<Trash className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<Dialog open={showDeleteDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							Are you sure you want to delete this design?
						</DialogTitle>
					</DialogHeader>
					<div className="flex justify-end mt-2">
						<Button
							className="mr-4"
							variant="secondary"
							onClick={() => setShowDeleteDialog(false)}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button
							className=""
							variant="destructive"
							onClick={() => {
								mutate(
									{ designId: design.id },
									{
										onSuccess: () => {
											setShowDeleteDialog(false);
										},
									},
								);
							}}
							disabled={isPending}
						>
							{isPending ? "Deleting..." : "Delete"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
			<NewCollectionModal
				firstDesign={design}
				open={isNewCollectionModalOpen}
				onOpenChange={setIsNewCollectionModalOpen}
			/>
		</>
	);
}

const DesignPreview = memo(DesignPreview_);

export default DesignPreview;
