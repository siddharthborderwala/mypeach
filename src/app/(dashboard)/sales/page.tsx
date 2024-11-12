import type { Metadata } from "next";
import { getCurrentUserSales } from "@/lib/actions/sales";
import { AllSales } from "./all-sales";
import { parseAsInteger } from "nuqs";

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

	const sales = await getCurrentUserSales({
		pagination: { page: page ?? 1 },
	});

	return <AllSales initialData={sales} />;
}
