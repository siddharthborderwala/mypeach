import type { Metadata } from "next";
import { getCurrentUserSales } from "@/lib/actions/sales";
import { AllSales } from "./all-sales";
import { parseAsInteger } from "nuqs";
import { VendorNotFound } from "@/components/vendor-not-found";

export const metadata: Metadata = {
	title: "Sales | Peach",
};

type SalesProps = {
	searchParams: {
		page: string;
	};
};

export default async function Sales({ searchParams }: SalesProps) {
	const page = parseAsInteger.withDefault(1).parse(searchParams.page);

	try {
		const sales = await getCurrentUserSales({
			pagination: { page: page ?? 1 },
		});

		return <AllSales initialData={sales} />;
	} catch (error) {
		if (error instanceof Error && error.message === "Vendor not found") {
			return <VendorNotFound title="Your Sales" />;
		}
		// Re-throw any other errors to be handled elsewhere
		throw error;
	}
}
