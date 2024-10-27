import type { Metadata } from "next";
import { getCurrentUserCollectionsList } from "@/lib/actions/collections";
import { AllCollections } from "./all-collections";
import { z } from "zod";

export const metadata: Metadata = {
	title: "Collections | Peach",
};

const searchParamsSchema = z.object({
	q: z.string().optional(),
});

export default async function Designs({
	searchParams,
}: {
	searchParams: { q?: string };
}) {
	const result = searchParamsSchema.safeParse(searchParams);
	const data = await getCurrentUserCollectionsList({
		search: result.success ? result.data.q : null,
	});

	return <AllCollections initialData={data} />;
}
