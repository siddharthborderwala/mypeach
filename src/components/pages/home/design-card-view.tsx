import { formatPrice, mimeToExtension } from "@/lib/utils";
import { relativeTime } from "@/lib/utils";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import type { ExploreDesign } from "./types";
import { getUserAvatarURL } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export const DesignCardView = ({
	design,
	details = "explore",
}: {
	design: ExploreDesign;
	details?: "explore" | "collection-view";
}) => (
	<>
		<div className="relative block w-full aspect-[3/4] rounded-lg overflow-hidden">
			<img
				src={getDesignThumbnailURL(design.thumbnailFileStorageKey, 1200)}
				alt={design.name}
				className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
				loading="lazy"
			/>
		</div>
		{details === "explore" ? (
			<div className="flex items-center justify-between gap-2 py-2">
				<div className="flex items-center gap-2">
					<Avatar className="h-9 w-9 rounded-full">
						<AvatarImage src={getUserAvatarURL(design.user.username, 72)} />
					</Avatar>
					<div className="flex flex-col">
						<p className="font-medium">{design.user.username}</p>
						<span
							suppressHydrationWarning
							className="text-sm text-muted-foreground"
						>
							Added {relativeTime(design.createdAt)}
						</span>
					</div>
				</div>
				<div className="flex flex-col items-end">
					<p className="font-medium">{formatPrice(design.price)}</p>
					<p className="text-sm text-muted-foreground">
						<span className="uppercase text-primary">
							{mimeToExtension(design.originalFileType)}
						</span>
						<span className="mx-2 font-bold">&middot;</span>
						<span className="text-primary">{design.fileDPI} DPI</span>
					</p>
				</div>
			</div>
		) : (
			<div className="flex items-start justify-between gap-2 py-2 text-sm">
				<div>
					<p className="font-medium">{design.name}</p>
					<p className="text-xs text-muted-foreground">
						<span className="uppercase text-primary">
							{mimeToExtension(design.originalFileType)}
						</span>
						<span className="mx-2 font-bold">&middot;</span>
						<span className="text-primary">{design.fileDPI} DPI</span>
					</p>
				</div>
				<p className="text-foreground/80">{formatPrice(design.price)}</p>
			</div>
		)}
	</>
);
