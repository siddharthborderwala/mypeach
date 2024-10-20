import { memo, useState } from "react";
import type { InfiniteScrollDesignsProps } from "./types";
import {
	appBaseURL,
	formatPrice,
	getUserAvatarURL,
	isMobileUA,
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
import { Button } from "@/components/ui/button";
import {
	CurrencyInr,
	ShareFat,
	ShoppingBag,
} from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import {
	addToActiveCart,
	type ActiveCartAndProducts,
} from "@/lib/actions/cart";
import { Spinner } from "@/components/spinner";
import { queryClient } from "@/app/global-query-client";

const AddToCartButton = ({
	designId,
	setIsModalOpen,
}: {
	designId: string;
	setIsModalOpen: (isModalOpen: boolean) => void;
}) => {
	const data = queryClient.getQueryData<ActiveCartAndProducts>(["cart"]);

	const isInCart = data?.products.some(
		(product) => product.designId === designId,
	);

	const { mutate, isPending } = useMutation({
		mutationKey: ["add-to-cart", designId],
		mutationFn: () => addToActiveCart(designId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
			toast.success("Added to cart");
			setIsModalOpen(false);
		},
		onError: () => {
			toast.error("Failed to add to cart");
		},
	});

	if (isInCart) {
		return (
			<Button disabled className="gap-2">
				<ShoppingBag weight="bold" />
				<span>Added to Cart</span>
			</Button>
		);
	}

	return (
		<Button disabled={isPending} onClick={() => mutate()} className="gap-2">
			{isPending ? <Spinner /> : <ShoppingBag weight="bold" />}
			<span>Add to Cart</span>
		</Button>
	);
};

const DesignCardDialogContent = ({
	design,
	setIsModalOpen,
}: {
	design: InfiniteScrollDesignsProps["initialData"]["designs"][number];
	setIsModalOpen: (isModalOpen: boolean) => void;
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
			<div className="mt-6 flex-1 flex flex-col">
				<div className="flex justify-between">
					<DialogTitle className="flex flex-col font-medium">
						<span className="text-lg">{design.name}</span>
						<span className="text-2xl text-foreground/90">
							{formatPrice(design.price)}
						</span>
					</DialogTitle>
					<Button
						onClick={function shareUrl() {
							const designURL = `${appBaseURL}/d/${design.id}`;
							const isMobile = isMobileUA(navigator.userAgent);

							if (navigator.share && isMobile) {
								navigator
									.share({
										url: designURL,
									})
									.then(() => console.log("Successful share"))
									.catch(() => {
										navigator.clipboard
											.writeText(designURL)
											.then(() => toast.success("Copied URL to clipboard"))
											.catch(() =>
												toast.error("Failed to copy URL to clipboard"),
											);
									});
							} else {
								navigator.clipboard
									.writeText(designURL)
									.then(() => toast.success("Copied URL to clipboard"))
									.catch(() => toast.error("Failed to copy URL to clipboard"));
							}
						}}
						size="sm"
						variant="outline"
						className="font-normal text-base"
					>
						<ShareFat weight="fill" className="text-muted-foreground" />
						<span className="ml-2">Share</span>
					</Button>
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
					<Button variant="outline">
						<CurrencyInr weight="bold" />
						<span className="ml-2">Buy Now</span>
					</Button>
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
}: {
	design: InfiniteScrollDesignsProps["initialData"]["designs"][number];
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
			<DialogTrigger className="text-left">
				<div className="relative block w-full aspect-[3/4] rounded-lg overflow-hidden">
					<img
						src={getDesignThumbnailURL(design.thumbnailFileStorageKey, 1200)}
						alt={design.name}
						className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
						loading="lazy"
					/>
				</div>
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
			</DialogTrigger>
			<DesignCardDialogContent
				design={design}
				setIsModalOpen={setIsModalOpen}
			/>
		</Dialog>
	);
};

export const DesignCard = memo(DesignCard_);
