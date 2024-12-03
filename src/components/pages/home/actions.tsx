"use client";

import { CollectionsPopover } from "@/components/collections-popover";
import { NewCollectionModal } from "@/components/new-collection-modal";
import { useAuth } from "@/contexts/auth";
import { Export, CaretDown } from "@phosphor-icons/react";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import type { ExploreDesign } from "./types";
import { useShareDesign } from "@/hooks/use-share-design";
import { cn } from "@/lib/utils";

export const Actions = ({
	design,
	share = true,
}: {
	design: ExploreDesign;
	share?: boolean;
}) => {
	const { isLoggedIn } = useAuth();

	const [isCollectionsPopoverOpen, setIsCollectionsPopoverOpen] =
		useState(false);
	const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] =
		useState(false);

	const designId = design.id;

	const handleShare = useShareDesign(designId);

	return (
		<div className="flex items-center">
			{share ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							onClick={handleShare}
							size="sm"
							variant="outline"
							className="font-normal h-10 w-10 sm:h-8 sm:w-8 p-0 rounded-r-none border-r-0"
						>
							<Export className="w-5 h-5 sm:w-4 sm:h-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>Share</TooltipContent>
				</Tooltip>
			) : null}
			{isLoggedIn ? (
				<>
					<CollectionsPopover
						open={isCollectionsPopoverOpen}
						onOpenChange={setIsCollectionsPopoverOpen}
						designToAdd={design.id}
						onCreateNewCollection={() => {
							setIsCollectionsPopoverOpen(false);
							setIsNewCollectionModalOpen(true);
						}}
					>
						{({ collectionsInWhichDesignIs }) => (
							<Button
								variant="outline"
								size="sm"
								className={cn("font-normal h-10 sm:h-8 p-0 px-2 gap-2", {
									"rounded-l-none": share,
									"px-4": !share,
								})}
								onClick={() => setIsCollectionsPopoverOpen(true)}
							>
								<span>
									{collectionsInWhichDesignIs &&
									collectionsInWhichDesignIs.length > 0
										? "Saved"
										: "Save"}
								</span>
								<CaretDown className="w-4 h-4 sm:w-3 sm:h-3" />
							</Button>
						)}
					</CollectionsPopover>
					<NewCollectionModal
						firstDesign={design}
						open={isNewCollectionModalOpen}
						onOpenChange={setIsNewCollectionModalOpen}
					/>
				</>
			) : (
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							className={cn(
								"font-normal text-base sm:text-sm h-10 sm:h-8 p-0 px-2 gap-2",
								{
									"rounded-l-none": share,
									"px-4": !share,
								},
							)}
							asChild
						>
							<Link
								href={`/login?redirectTo=${encodeURIComponent(
									`/d/${designId}`,
								)}`}
							>
								Save
								<CaretDown className="w-4 h-4 sm:w-3 sm:h-3" />
							</Link>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Login to Save</TooltipContent>
				</Tooltip>
			)}
		</div>
	);
};
