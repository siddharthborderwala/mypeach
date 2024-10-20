"use client";

import { useQuery } from "@tanstack/react-query";

import {
	type ActiveCartAndProducts,
	getActiveCartAndProducts,
} from "@/lib/actions/cart";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ShoppingBag } from "@phosphor-icons/react/dist/ssr";
import { CartItem } from "./cart-item";

export function CheckoutView({
	initialData,
}: { initialData: ActiveCartAndProducts }) {
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

	return itemCount > 0 ? (
		<>
			<ul className="col-span-2 row-span-2">
				{data.products.map((product) => (
					<CartItem key={product.designId} product={product} />
				))}
			</ul>
			<div className="flex justify-between mb-8 col-span-1">
				<div className="text-xl font-semibold">Total: {formatPrice(total)}</div>
				<div className="text-muted-foreground">
					{itemCount} item{itemCount > 1 ? "s" : ""}
				</div>
			</div>
		</>
	) : (
		<div className="col-span-3 flex flex-col items-center justify-center text-center mt-40">
			<ShoppingBag size={48} />
			<p className="text-xl mt-4">Your cart is empty!</p>
			<Button asChild className="mt-8">
				<Link href="/">Continue Shopping</Link>
			</Button>
		</div>
	);
}
