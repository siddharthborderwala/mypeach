import { CollectionsPopover } from "@/components/collections-popover";
import { NewCollectionModal } from "@/components/new-collection-modal";
import { useAuth } from "@/contexts/auth";
import { appBaseURL, isMobileUA } from "@/lib/utils";
import { Export, CaretDown } from "@phosphor-icons/react";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { ExploreDesign } from "./types";

export const Actions = ({
	design,
}: {
	design: ExploreDesign;
}) => {
	const { isLoggedIn } = useAuth();

	const [isCollectionsPopoverOpen, setIsCollectionsPopoverOpen] =
		useState(false);
	const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] =
		useState(false);

	const designId = design.id;

	const handleShare = useCallback(() => {
		const designURL = `${appBaseURL}/d/${designId}`;
		const isMobile = isMobileUA(navigator.userAgent);

		if (navigator.share && isMobile) {
			navigator
				.share({
					url: designURL,
				})
				.catch(() => {
					navigator.clipboard
						.writeText(designURL)
						.then(() => toast.success("Copied URL to clipboard"))
						.catch(() => toast.error("Failed to copy URL to clipboard"));
				});
		} else {
			navigator.clipboard
				.writeText(designURL)
				.then(() => toast.success("Copied URL to clipboard"))
				.catch(() => toast.error("Failed to copy URL to clipboard"));
		}
	}, [designId]);

	return (
		<div className="flex items-center">
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						onClick={handleShare}
						size="sm"
						variant="outline"
						className="font-normal h-8 w-8 p-0 rounded-r-none border-r-0"
					>
						<Export className="w-4 h-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Share</TooltipContent>
			</Tooltip>
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
								className="font-normal h-8 p-0 px-2 rounded-l-none gap-2"
								onClick={() => setIsCollectionsPopoverOpen(true)}
							>
								<span>
									{collectionsInWhichDesignIs &&
									collectionsInWhichDesignIs.length > 0
										? "Saved"
										: "Save"}
								</span>
								<CaretDown className="w-3 h-3" />
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
							className="font-normal h-8 p-0 px-2 rounded-l-none gap-2"
							asChild
						>
							<Link
								href={`/login?redirectTo=${encodeURIComponent(
									`/d/${designId}`,
								)}`}
							>
								Save
								<CaretDown className="w-3 h-3" />
							</Link>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Login to Save</TooltipContent>
				</Tooltip>
			)}
		</div>
	);
};
