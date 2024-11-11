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
import { ProceedToPaymentForm } from "./proceed-to-payment";

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

	const calculatedTotal = () => {
		// add 18% GST
		return total + total * 0.18;
	};

	return (
		<main className="container mx-auto py-8 max-w-5xl">
			<h1 className="text-3xl font-bold mb-8">Checkout</h1>
			<div className="grid grid-cols-3 grid-rows-[auto_auto] gap-8">
				{itemCount > 0 ? (
					<>
						<ul className="col-span-2 row-span-2">
							{data.products.map((product) => (
								<CartItem key={product.designId} product={product} />
							))}
						</ul>
						<div>
							<div className="flex justify-between mb-2 col-span-1">
								<div className="text-xl font-semibold">
									Total: {formatPrice(total + total * 0.18)}
								</div>
								<div className="text-muted-foreground">
									{itemCount} item{itemCount > 1 ? "s" : ""}
								</div>
							</div>
							<div className="text-neutral-500 text-sm mb-8">
								GST: {formatPrice(calculatedTotal() - total)}
							</div>
						</div>
						<div className="col-span-1">
							<ProceedToPaymentForm
								amount={calculatedTotal()}
								cartId={data.cart?.id as number}
							/>
							<p className="text-xs text-muted-foreground text-center mt-2">
								Secured by{" "}
								<Link href="https://www.cashfree.com/" className="underline">
									Cashfree
								</Link>
							</p>
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
				)}
			</div>
		</main>
	);
}
