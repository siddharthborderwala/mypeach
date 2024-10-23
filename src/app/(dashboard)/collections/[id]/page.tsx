import {
	getCollectionById,
	getCollectionDesigns,
} from "@/lib/actions/collections";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function CollectionPage({
	params,
}: {
	params: { id: string };
}) {
	const collection = await getCollectionById(params.id);
	const collectionDesigns = await getCollectionDesigns(params.id);

	return (
		<main className="relative flex h-[calc(100svh-3.5rem)] flex-col gap-4 md:gap-6">
			<div className="flex items-center justify-between pt-4 px-4 md:pt-8 md:px-8">
				<h1 className="text-lg font-semibold md:text-2xl">{collection.name}</h1>
			</div>
			<ScrollArea>
				<div className="pb-4 px-4 md:pb-8 md:px-8">
					{collectionDesigns.designs.map((d) => (
						<div key={d.design.id}>
							<h3>{d.design.name}</h3>
						</div>
					))}
				</div>
			</ScrollArea>
		</main>
	);
}
