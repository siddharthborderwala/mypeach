"use client";

import { DialogClose, DialogContent } from "@/components/ui/dialog";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import { formatPrice, mimeToExtension, relativeTime } from "@/lib/utils";
import { Actions } from "./actions";
import type { ExploreDesign } from "./types";
import { AddToCartButton } from "./add-to-cart-button";
import { Export, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/image-with-fallback";
import { useShareDesign } from "@/hooks/use-share-design";

function ShareDesignButton({ designId }: { designId: string }) {
	const handleShare = useShareDesign(designId);

	return (
		<Button variant="outline" onClick={handleShare} className="h-12 flex-[1]">
			<Export weight="bold" />
			<span className="ml-2">Share</span>
		</Button>
	);
}

export function DesignCardDialogMobile({
	design,
	setIsModalOpen,
}: {
	design: ExploreDesign;
	setIsModalOpen: (isModalOpen: boolean) => void;
}) {
	return (
		<DialogContent
			isCloseButtonHidden={true}
			onOpenAutoFocus={(e) => e.preventDefault()}
			className="flex flex-col items-start w-[100dvw] h-[100dvh] m-0 p-0 rounded-none max-w-none"
		>
			<DialogClose asChild>
				<Button
					variant="default"
					size="icon"
					className="absolute right-4 top-4 z-50"
				>
					<X weight="bold" className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</Button>
			</DialogClose>
			<div className="relative overflow-y-auto w-full pb-24">
				<div className="relative h-[60dvh] w-full bg-[hsl(0,0%,87%)] border-b shadow-inner flex items-center justify-center">
					<ImageWithFallback
						src={getDesignThumbnailURL(design.thumbnailFileStorageKey, 1200)}
						alt={design.name}
						className="w-full h-[80%] object-contain select-none pointer-events-none drop-shadow-lg"
						loading="lazy"
					/>
				</div>
				<div className="flex justify-between mt-4 px-4">
					<div className="flex flex-col">
						<p className="text-2xl font-medium">{design.name}</p>
						<p className="font-bold">
							<span className="uppercase text-primary">
								{mimeToExtension(design.originalFileType)}
							</span>
							<span className="text-muted-foreground ml-1">
								({design.fileDPI} DPI)
							</span>
						</p>
					</div>
					<p className="text-2xl text-foreground/90 font-medium">
						{formatPrice(design.price)}
					</p>
				</div>
				<div className="px-4 mt-4 flex justify-between">
					<div className="flex flex-col mr-auto">
						<p className="font-medium">by {design.vendor.user.username}</p>
						<span
							suppressHydrationWarning
							className="text-xs text-muted-foreground"
						>
							Added {relativeTime(design.createdAt)}
						</span>
					</div>
					<Actions design={design} share={false} />
				</div>
			</div>

			<div className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-sm bg-background/80 border-t flex gap-2">
				<ShareDesignButton designId={design.id} />
				<AddToCartButton
					designId={design.id}
					onAdd={() => setIsModalOpen(false)}
					className="h-12 flex-[2]"
				/>
			</div>
		</DialogContent>
	);
}
