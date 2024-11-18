import type { Metadata } from "next";
import { AllOrders } from "./all-orders";
import { parseAsInteger } from "nuqs";
import { VendorNotFound } from "@/components/vendor-not-found";
import { getCurrentUserOrders } from "@/lib/actions/orders";

export const metadata: Metadata = {
	title: "Orders | Peach",
};

type OrdersProps = {
	searchParams: {
		page: string;
	};
};

export default async function Orders({ searchParams }: OrdersProps) {
	const page = parseAsInteger.withDefault(1).parse(searchParams.page);

	try {
		const orders = await getCurrentUserOrders({
			pagination: { page: page ?? 1 },
		});

		return <AllOrders initialData={orders} />;
	} catch (error) {
		if (error instanceof Error && error.message === "Vendor not found") {
			return <VendorNotFound title="Your Sales" />;
		}
		// Re-throw any other errors to be handled elsewhere
		throw error;
	}
}
