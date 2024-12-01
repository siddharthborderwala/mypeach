"use client";

import { memo, useState } from "react";
import type { ExploreDesign } from "./types";
import {
	cn,
	formatPrice,
	getUserAvatarURL,
	mimeToExtension,
	relativeTime,
} from "@/lib/utils";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import RelatedDesignsMiniList from "./related-designs";
import { DesignCardView } from "./design-card-view";
import { Actions } from "./actions";
import { AddToCartButton } from "./add-to-cart-button";
import { useMediaQuery } from "use-media-query-react";
import { DesignCardDialogMobile } from "./design-card-dialog-mobile";
import ImageWithFallback from "@/components/image-with-fallback";

const DesignCardDialogContent = ({
	design,
	setIsModalOpen,
}: {
	design: ExploreDesign;
	setIsModalOpen: (isModalOpen: boolean) => void;
}) => (
	<DialogContent
		onOpenAutoFocus={(e) => e.preventDefault()}
		className="flex flex-row items-start w-fit max-w-[unset] h-[90svh] gap-6"
	>
		<div className="relative block h-full aspect-[3/4] rounded-lg overflow-hidden">
			<ImageWithFallback
				src={getDesignThumbnailURL(design.thumbnailFileStorageKey, 1200)}
				alt={design.name}
				className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
				loading="lazy"
			/>
		</div>
		<div className="w-[24rem] flex flex-col h-full">
			<div className="flex flex-row items-center gap-2">
				<Avatar className="h-9 w-9">
					<AvatarImage
						src={getUserAvatarURL(design.vendor.user.username, 72)}
					/>
				</Avatar>
				<div className="flex flex-col">
					<p className="font-medium">{design.vendor.user.username}</p>
					<span
						suppressHydrationWarning
						className="text-xs text-muted-foreground"
					>
						Added {relativeTime(design.createdAt)}
					</span>
				</div>
			</div>
			<div className="mt-6 flex-1 flex flex-col">
				<div className="flex justify-between">
					<DialogTitle className="flex flex-col font-medium">
						<span className="text-lg">{design.name}</span>
						<span className="text-2xl text-foreground/90">
							{formatPrice(design.price)}
						</span>
					</DialogTitle>
					<Actions design={design} />
				</div>
				<div className="space-y-3 mt-4">
					<div className="grid grid-cols-2">
						<div>
							<h3 className="text-sm tracking-wider uppercase text-muted-foreground">
								File Type
							</h3>
							<p className="uppercase">
								{mimeToExtension(design.originalFileType)}
							</p>
						</div>
						<div>
							<h3 className="text-sm tracking-wider uppercase text-muted-foreground">
								File Quality
							</h3>
							<p>{design.fileDPI} DPI</p>
						</div>
					</div>
					{design.tags.length > 0 ? (
						<div>
							<h3 className="text-sm tracking-wider uppercase text-muted-foreground">
								Tags
							</h3>
							<div className="flex flex-wrap gap-2 mt-1">
								{design.tags.map((tag) => (
									<Badge
										variant="outline"
										key={tag}
										className="font-normal border select-none text-sm"
									>
										{tag}
									</Badge>
								))}
							</div>
						</div>
					) : null}
				</div>
				<div className="flex flex-col gap-2 mt-auto">
					<AddToCartButton
						designId={design.id}
						setIsModalOpen={setIsModalOpen}
					/>
				</div>
			</div>
			<RelatedDesignsMiniList designId={design.id} />
		</div>
	</DialogContent>
);

const DesignCard_ = ({
	design,
	className,
	style,
	disableModal,
}: {
	design: ExploreDesign;
	className?: string;
	style?: React.CSSProperties;
	disableModal?: boolean;
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const isMobile = useMediaQuery("(max-width: 768px)");

	return (
		<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
			<DialogTrigger
				className={cn("text-left", className, {
					"pointer-events-none opacity-100": disableModal,
				})}
				style={style}
				disabled={disableModal}
			>
				<DesignCardView design={design} />
			</DialogTrigger>
			{isMobile ? (
				<DesignCardDialogMobile
					design={design}
					setIsModalOpen={setIsModalOpen}
				/>
			) : (
				<DesignCardDialogContent
					design={design}
					setIsModalOpen={setIsModalOpen}
				/>
			)}
		</Dialog>
	);
};

export const DesignCard = memo(DesignCard_);
