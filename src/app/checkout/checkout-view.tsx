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
		<main className="container sm:mx-auto pt-4 p-6 sm:py-8 sm:max-w-5xl">
			<h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-8">
				Checkout{" "}
				<span className="text-muted-foreground">
					({itemCount} item{itemCount > 1 ? "s" : ""})
				</span>
			</h1>
			<div className="sm:grid sm:grid-cols-3 sm:grid-rows-[auto_auto] sm:gap-8">
				{itemCount > 0 ? (
					<>
						<ul className="col-span-2 row-span-2">
							{data.products.map((product) => (
								<CartItem key={product.designId} product={product} />
							))}
						</ul>
						<div className="max-sm:mt-6">
							<div className="space-y-2 mb-8">
								<div className="flex justify-between">
									<p>Subtotal</p>
									<p>{formatPrice(total)}</p>
								</div>
								<div className="flex justify-between">
									<p>GST (18%)</p>
									<p>{formatPrice(total * 0.18)}</p>
								</div>
								<hr />
								<div className="flex justify-between font-bold text-lg">
									<p>Total</p>
									<p>{formatPrice(calculatedTotal())}</p>
								</div>
							</div>
						</div>
						<div className="fixed bottom-0 left-0 right-0 sm:static max-sm:p-4 max-sm:bg-background max-sm:backdrop-blur-[2px] max-sm:border-t sm:p-0 col-span-1 max-sm:flex font-bold max-sm:!text-base max-sm:gap-4">
							<div className="sm:hidden">
								<p className="font-bold text-lg">
									{formatPrice(calculatedTotal())}
								</p>
								<p className="font-bold text-sm uppercase text-muted-foreground">
									Total
								</p>
							</div>
							<ProceedToPaymentForm
								cartId={data.cart?.id as number}
								className="flex-1"
							/>
							<p className="hidden sm:block text-xs text-muted-foreground text-center mt-3">
								Secured by{" "}
								<a
									href="https://www.cashfree.com"
									target="_blank"
									rel="noopener noreferrer"
									className="underline"
								>
									Cashfree
								</a>
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
