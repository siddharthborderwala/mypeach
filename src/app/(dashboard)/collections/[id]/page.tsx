import {
	getCollectionById,
	getCollectionDesigns,
} from "@/lib/actions/collections";
import { notFound } from "next/navigation";
import { AllCollectionItems } from "./all-collection-items";

export default async function CollectionPage({
	params,
}: {
	params: { id: string };
}) {
	const collection = await getCollectionById(params.id);

	if (!collection) {
		notFound();
	}

	const collectionDesigns = await getCollectionDesigns(params.id);

	return (
		<AllCollectionItems
			initialData={collectionDesigns}
			collection={collection}
		/>
	);
}
