"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ShoppingBag, TrashSimple, X } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	type ActiveCartAndProducts,
	getActiveCartAndProducts,
	removeItemAction,
} from "@/lib/actions/cart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPrice, mimeToExtension } from "@/lib/utils";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import Link from "next/link";
import { memo } from "react";
import { queryClient } from "@/app/global-query-client";
import ImageWithFallback from "../image-with-fallback";

function CartItem_({
	product,
}: { product: ActiveCartAndProducts["products"][number] }) {
	const { mutate, isPending } = useMutation({
		mutationFn: () => removeItemAction(product.designId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
		},
	});

	return (
		<div key={product.designId} className="flex items-start gap-4 mb-4">
			<Link href={`/d/${product.designId}?from=explore`} prefetch={false}>
				<ImageWithFallback
					src={getDesignThumbnailURL(
						product.design.thumbnailFileStorageKey,
						1200,
					)}
					alt={product.design.name}
					className="w-40 h-40 object-cover rounded-lg"
				/>
			</Link>
			<div className="flex flex-col items-start max-w-[calc(100%-12rem)]">
				<p className="text-lg font-medium text-foreground h-auto p-0 max-w-full truncate">
					{product.design.name}
				</p>
				<p className="text-sm mt-1">
					<span className="text-primary">{product.design.fileDPI} DPI</span>
					<span className="mx-1">&middot;</span>
					<span className="text-primary uppercase">
						{mimeToExtension(product.design.originalFileType)}
					</span>
				</p>
				<p className="mt-4 text-lg font-semibold">
					{formatPrice(product.design.price)}
				</p>
				<Button
					size="icon"
					variant="ghost"
					onClick={() => mutate()}
					disabled={isPending}
					className="mt-4 hover:text-destructive transition-colors"
				>
					<span className="sr-only">Remove from cart</span>
					<TrashSimple size={16} weight="bold" />
				</Button>
			</div>
		</div>
	);
}

const CartItem = memo(CartItem_);

export function SidebarCart({
	initialData,
}: {
	initialData: ActiveCartAndProducts;
}) {
	const { data } = useQuery({
		queryKey: ["cart"],
		queryFn: () => getActiveCartAndProducts(),
		initialData,
	});

	const itemCount = data.products.length;

	const total = data.products.reduce(
		(acc, product) => acc + product.design.price,
		0,
	);

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					className="text-sm h-auto p-2 font-normal gap-2 items-center relative"
				>
					<ShoppingBag className="h-6 w-6 sm:h-5 sm:w-5" />
					{itemCount > 0 ? (
						<span
							aria-label={`${itemCount} item${itemCount > 1 ? "s" : ""} in cart`}
							className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
						>
							{itemCount}
						</span>
					) : null}
					<span className="sr-only">Cart</span>
				</Button>
			</SheetTrigger>
			<SheetContent
				isCloseButtonHidden={true}
				side="right"
				className="flex flex-col bg-background max-sm:w-full"
			>
				<SheetClose asChild>
					<Button
						variant="ghost"
						size="icon"
						className="absolute right-4 top-4 z-50"
					>
						<X weight="bold" className="h-5 w-5" />
						<span className="sr-only">Close</span>
					</Button>
				</SheetClose>
				<h2 className="text-xl sm:text-lg font-semibold">Your Cart</h2>
				{itemCount > 0 ? (
					<>
						<ScrollArea className="flex-grow">
							{data.products.map((product) => (
								<CartItem key={product.designId} product={product} />
							))}
						</ScrollArea>
					</>
				) : (
					<div className="flex flex-col items-center justify-center h-full">
						<ShoppingBag size={80} className="text-muted-foreground" />
						<p className="text-gray-500">Your cart is empty!</p>
					</div>
				)}
				<div>
					{itemCount > 0 ? (
						<>
							<div className="flex mb-4">
								<div className="text-base sm:text-sm flex justify-between w-full font-medium">
									<p>Subtotal</p>
									<p>
										<span>{formatPrice(total)}</span>
										<span className="text-muted-foreground text-sm ml-2">
											({itemCount} item{itemCount > 1 ? "s" : ""})
										</span>
									</p>
								</div>
							</div>
							<Button className="w-full" asChild>
								<Link prefetch={false} href="/checkout">
									<span>Checkout</span>
								</Link>
							</Button>
						</>
					) : (
						<SheetClose asChild>
							<Button className="w-full max-sm:h-10">Continue Shopping</Button>
						</SheetClose>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
