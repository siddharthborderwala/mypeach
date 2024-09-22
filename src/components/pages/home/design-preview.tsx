"use client";

import ImageWithFallback from "@/components/image-with-fallback";
import type { getCurrentUserDesigns } from "@/lib/actions/designs";
import { getUserContentUrl } from "@/lib/storage/util";
import { useAtomValue } from "jotai";
import { parseAsString, useQueryState } from "nuqs";
import { designIdAtom } from "./new-design-modal/atoms";
import { Badge } from "@/components/ui/badge";

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
	const uploadingDesignId = useAtomValue(designIdAtom);

	return (
		<button
			type="button"
			className="border rounded-lg p-4 shadow-sm"
			onClick={() => setDesign(design.id)}
		>
			<ImageWithFallback
				src={getDesignThumbnailURL(design.thumbnailFileStorageKey, 1200)}
				width="100%"
				className="aspect-square flex items-center justify-center"
			/>
			<div className="flex flex-col mt-2 text-left">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold truncate">{design.name}</h3>
					{uploadingDesignId === design.id && <Badge>Uploading</Badge>}
				</div>
				<p className="text-sm text-muted-foreground truncate">
					{design.originalFileName}
				</p>
			</div>
		</button>
	);
}
