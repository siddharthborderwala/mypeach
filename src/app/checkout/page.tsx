import { getActiveCartAndProducts } from "@/lib/actions/cart";
import { redirect } from "next/navigation";
import { CheckoutView } from "./checkout-view";
import { Header } from "./header";
import { ProceedToPaymentForm } from "./proceed-to-payment";

export default async function CheckoutPage() {
	const initialData = await getActiveCartAndProducts();

	if (initialData.products.length === 0) {
		redirect("/");
	}

	return (
		<>
			<Header />
			<main className="container mx-auto py-8 max-w-5xl">
				<h1 className="text-3xl font-bold mb-8">Checkout</h1>
				<div className="grid grid-cols-3 grid-rows-[auto_auto] gap-8">
					<CheckoutView initialData={initialData} />
					<div className="col-span-1">
						<ProceedToPaymentForm />
						<p className="text-xs text-muted-foreground text-center mt-2">
							Secured by Razorpay
						</p>
					</div>
				</div>
			</main>
		</>
	);
}
