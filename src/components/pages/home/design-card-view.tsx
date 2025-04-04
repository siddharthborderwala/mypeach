import { formatPrice, mimeToExtension } from "@/lib/utils";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import type { ExploreDesign } from "./types";
import ImageWithFallback from "@/components/image-with-fallback";

export const DesignCardView = ({
	design,
	details = "explore",
}: {
	design: ExploreDesign;
	details?: "explore" | "collection-view";
}) => (
	<>
		<div className="relative block w-full aspect-[3/4] rounded-lg overflow-hidden">
			<ImageWithFallback
				src={getDesignThumbnailURL(design.thumbnailFileStorageKey, 1200)}
				alt={design.name}
				className="absolute inset-0 w-full h-full object-cover transition-all duration-300 rounded-lg select-none pointer-events-none"
				loading="lazy"
			/>
		</div>
		{details === "explore" ? (
			<div className="py-2">
				<div className="flex items-start justify-between gap-2 font-medium">
					<p className="w-[60%] truncate">{design.name}</p>
					<p>{formatPrice(design.price)}</p>
				</div>
				<p className="font-semibold -mt-1">
					<span className="uppercase text-primary max-sm:text-sm">
						{mimeToExtension(design.originalFileType)}
					</span>
					<span className="text-muted-foreground max-sm:text-xs text-sm ml-1">
						({design.fileDPI} DPI)
					</span>
				</p>
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
