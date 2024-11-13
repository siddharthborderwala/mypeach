import { getPurchasedDesigns } from "@/lib/actions/designs";
import type { Metadata } from "next";
import { PurchasedDesigns } from "./purchased-designs";

export const metadata: Metadata = {
	title: "Purchases | Peach",
};

export default async function Purchases() {
	// Attempt to get the designs data
	const data = await getPurchasedDesigns();

	return <PurchasedDesigns initialData={data} />;
}
