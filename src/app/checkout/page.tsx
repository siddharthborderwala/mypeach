import { getActiveCartAndProducts } from "@/lib/actions/cart";
import { redirect } from "next/navigation";
import { CheckoutView } from "./checkout-view";
import { Header } from "./header";

export default async function CheckoutPage() {
	const initialData = await getActiveCartAndProducts();

	if (initialData.products.length === 0) {
		redirect("/");
	}

	return (
		<>
			<Header />
			<CheckoutView initialData={initialData} />
		</>
	);
}
