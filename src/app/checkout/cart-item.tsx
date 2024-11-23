"use client";

import Link from "next/link";
import { memo } from "react";
import { TrashSimple } from "@phosphor-icons/react";
import {
	removeItemAction,
	type ActiveCartAndProducts,
} from "@/lib/actions/cart";
import { formatPrice, mimeToExtension } from "@/lib/utils";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/app/global-query-client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";

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
			<img
				src={getDesignThumbnailURL(product.design.thumbnailFileStorageKey, 600)}
				alt={product.design.name}
				className="w-24 sm:w-60 object-scale-down rounded-lg bg-gray-50"
			/>
			<div className="flex flex-col items-start">
				<Button
					variant="link"
					className="text-lg text-foreground h-auto p-0 max-sm:max-w-[40svw] truncate"
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
					className="mt-4 hidden sm:block hover:text-destructive transition-colors"
				>
					<span className="sr-only">Remove from cart</span>
					{isPending ? <Spinner /> : <TrashSimple size={16} weight="bold" />}
				</Button>
			</div>
			<Button
				size="icon"
				variant="outline"
				onClick={() => mutate()}
				disabled={isPending}
				className="ml-auto sm:hidden hover:text-destructive transition-colors"
			>
				<span className="sr-only">Remove from cart</span>
				{isPending ? <Spinner /> : <TrashSimple size={16} weight="bold" />}
			</Button>
		</div>
	);
}

export const CartItem = memo(CartItem_);
