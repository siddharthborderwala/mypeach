import { memo, Suspense } from "react";
import type { InfiniteScrollDesignsProps } from "./types";
import { formatPrice, getUserAvatarURL, relativeTime } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import RelatedDesignsMiniList from "./related-designs-mini-list";

const DesignCardDialogContent = ({
	design,
}: {
	design: InfiniteScrollDesignsProps["initialData"]["designs"][number];
}) => (
	<DialogContent className="flex flex-row items-start w-fit max-w-[unset] h-[90svh] gap-6">
		<div className="relative block h-full aspect-[3/4] rounded-lg overflow-hidden">
			<img
				src={getDesignThumbnailURL(design.thumbnailFileStorageKey, 1200)}
				alt={design.name}
				className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
				loading="lazy"
			/>
		</div>
		<div className="w-[24rem] flex flex-col h-full">
			<div className="flex flex-row items-center gap-2">
				<Avatar className="h-9 w-9">
					<AvatarImage src={getUserAvatarURL(design.user.username, 72)} />
				</Avatar>
				<div className="flex flex-col">
					<p className="font-medium">{design.user.username}</p>
					<span
						suppressHydrationWarning
						className="text-xs text-muted-foreground"
					>
						Added {relativeTime(design.createdAt)}
					</span>
				</div>
			</div>
			<div className="mt-4 flex-1">
				<div className="flex items-center justify-between">
					<p className="text-lg font-medium">{design.name}</p>
					<Badge variant="default">{design.fileDPI} DPI</Badge>
				</div>
				<div className="flex flex-wrap gap-2 mt-2">
					{design.tags.map((tag) => (
						<Badge
							variant="outline"
							key={tag}
							className="font-normal border select-none"
						>
							{tag}
						</Badge>
					))}
				</div>
			</div>
			<RelatedDesignsMiniList designId={design.id} />
		</div>
	</DialogContent>
);

const DesignCard_ = ({
	design,
}: {
	design: InfiniteScrollDesignsProps["initialData"]["designs"][number];
}) => {
	return (
		<Dialog>
			<div>
				<DialogTrigger className="relative block w-full aspect-[3/4]">
					<img
						src={getDesignThumbnailURL(design.thumbnailFileStorageKey, 1200)}
						alt={design.name}
						className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
						loading="lazy"
					/>
				</DialogTrigger>
				<div className="flex items-center justify-between gap-2 py-2">
					<div className="flex items-center gap-2">
						<Avatar className="h-9 w-9 rounded-full">
							<AvatarImage src={getUserAvatarURL(design.user.username, 72)} />
						</Avatar>
						<div className="flex flex-col">
							<p className="font-medium">{design.user.username}</p>
							<span
								suppressHydrationWarning
								className="text-xs text-muted-foreground"
							>
								Added {relativeTime(design.createdAt)}
							</span>
						</div>
					</div>
					<div className="flex flex-col items-end">
						<p className="font-medium">{formatPrice(design.price)}</p>
						<p className="text-xs text-muted-foreground">
							{design.fileDPI} DPI
						</p>
					</div>
				</div>
			</div>
			<DesignCardDialogContent design={design} />
		</Dialog>
	);
};

export const DesignCard = memo(DesignCard_);
