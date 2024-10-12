"use client";

import ImageWithFallback from "@/components/image-with-fallback";
import type { DesignData } from "@/lib/actions/designs";
import { getDesignThumbnailURL, getUserContentUrl } from "@/lib/storage/util";
import { parseAsString, useQueryState } from "nuqs";
import { Badge } from "@/components/ui/badge";
import { useUploadContext } from "./upload-context";
import Separator from "@/components/ui/separator";
import { PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDeleteDesign } from "@/hooks/dashboard";

export default function DesignPreview({
	design,
}: {
	design: DesignData;
}) {
	const [, setDesign] = useQueryState("design", parseAsString);
	const { newDesignId } = useUploadContext();
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const { mutate, isPending } = useDeleteDesign();

	return (
		<>
			<button
				type="button"
				className="border rounded-lg p-4 shadow-sm"
				onClick={() => setDesign(design.id)}
			>
				<ImageWithFallback
					suppressHydrationWarning
					src={getDesignThumbnailURL(design.thumbnailFileStorageKey, 1200)}
					width="100%"
					className="aspect-square flex items-center justify-center select-none pointer-events-none object-cover"
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
				<Separator />
				<div className="mt-3 flex">
					<PencilSimple className="mr-2" size={18} weight="regular" />
					<Trash
						size={18}
						weight="regular"
						onClick={(e) => {
							e.stopPropagation();
							setShowDeleteDialog(true);
						}}
					/>
				</div>
			</button>
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
		</>
	);
}
