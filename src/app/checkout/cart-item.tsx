"use client";

import Link from "next/link";
import { memo } from "react";
import { TrashSimple } from "@phosphor-icons/react";
import type { ActiveCartAndProducts } from "@/lib/actions/cart";
import { formatPrice, mimeToExtension } from "@/lib/utils";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/app/global-query-client";
import { Button } from "@/components/ui/button";
import { removeFromCart } from "@/lib/cart";

function CartItem_({
	product,
}: { product: ActiveCartAndProducts["products"][number] }) {
	const { mutate, isPending } = useMutation({
		mutationFn: () => removeFromCart(product.designId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["cart"] });
		},
	});

	return (
		<div key={product.designId} className="flex items-start gap-4 mb-4">
			<img
				src={getDesignThumbnailURL(
					product.design.thumbnailFileStorageKey,
					1200,
				)}
				alt={product.design.name}
				className="w-60 object-contain rounded-lg"
			/>
			<div className="flex flex-col">
				<Button
					variant="link"
					className="text-lg text-foreground h-auto p-0"
					asChild
				>
					<Link
						href={`/d/${product.designId}`}
						prefetch={false}
						target="_blank"
					>
						{product.design.name}
					</Link>
				</Button>
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

export const CartItem = memo(CartItem_);
