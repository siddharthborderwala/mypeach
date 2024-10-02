"use client";

import ImageWithFallback from "@/components/image-with-fallback";
import type { getCurrentUserDesigns } from "@/lib/actions/designs";
import { getUserContentUrl } from "@/lib/storage/util";
import { parseAsString, useQueryState } from "nuqs";
import { Badge } from "@/components/ui/badge";
import { useUploadContext } from "./upload-context";

function getDesignThumbnailURL(key: string | null, width: 2000 | 1200) {
	if (!key) {
		return "";
	}
	return getUserContentUrl(`${key}/${width}.webp`);
}

export default function DesignPreview({
	design,
}: {
	design: Awaited<ReturnType<typeof getCurrentUserDesigns>>[number];
}) {
	const [, setDesign] = useQueryState("design", parseAsString);
	const { newDesignId } = useUploadContext();

	return (
		<button
			type="button"
			className="border rounded-lg p-4 shadow-sm"
			onClick={() => setDesign(design.id)}
		>
			<ImageWithFallback
				src={getDesignThumbnailURL(design.thumbnailFileStorageKey, 1200)}
				width="100%"
				className="aspect-square flex items-center justify-center select-none pointer-events-none"
			/>
			<div className="flex flex-col mt-2 text-left">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold truncate">{design.name}</h3>
					{newDesignId === design.id && <Badge>Uploading</Badge>}
				</div>
				<p className="text-sm text-muted-foreground truncate">
					{design.originalFileName}
				</p>
			</div>
		</button>
	);
}
