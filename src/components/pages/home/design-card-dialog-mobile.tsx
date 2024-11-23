"use client";

import { DialogClose, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DialogTitle } from "@/components/ui/dialog";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import {
	formatPrice,
	getUserAvatarURL,
	mimeToExtension,
	relativeTime,
} from "@/lib/utils";
import RelatedDesignsMiniList from "./related-designs";
import { Actions } from "./actions";
import type { ExploreDesign } from "./types";
import { AddToCartButton } from "./add-to-cart-button";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

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
			className="flex flex-col items-start w-[100svw] h-[100svh] m-0 p-0 rounded-none"
		>
			<DialogClose asChild>
				<Button
					variant="outline"
					size="icon"
					className="absolute right-4 top-4 z-50"
				>
					<X weight="bold" className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</Button>
			</DialogClose>
			<div className="relative overflow-y-auto w-full">
				<div className="relative h-[50svh] w-full">
					<img
						src={getDesignThumbnailURL(design.thumbnailFileStorageKey, 1200)}
						alt={design.name}
						className="absolute inset-0 w-full h-full object-scale-down select-none pointer-events-none"
						loading="lazy"
					/>
				</div>
				<div className="flex flex-col flex-1 px-4 py-4">
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

					<div className="mt-6">
						<div className="flex justify-between">
							<DialogTitle className="flex flex-col font-medium">
								<span className="text-lg">{design.name}</span>
								<span className="text-2xl text-foreground/90">
									{formatPrice(design.price)}
								</span>
							</DialogTitle>
							<Actions design={design} />
						</div>

						<div className="grid grid-cols-2 mt-4 gap-2">
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

							{design.tags.length > 0 && (
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
							)}
						</div>
					</div>

					<div className="mt-4">
						<RelatedDesignsMiniList designId={design.id} />
					</div>
				</div>
			</div>

			<div className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-[1px] bg-background/80 border-t">
				<AddToCartButton
					designId={design.id}
					setIsModalOpen={setIsModalOpen}
					className="w-full h-10"
				/>
			</div>
		</DialogContent>
	);
}
