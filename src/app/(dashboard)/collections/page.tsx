import type { Metadata } from "next";
import { AllCollections } from "./all-collections";
import { getCurrentUserCollectionsList } from "@/lib/actions/collections";

export const metadata: Metadata = {
	title: "Collections | Peach",
};

export default async function Designs() {
	const data = await getCurrentUserCollectionsList();

	return <AllCollections initialData={data} />;
}
