import Link from "next/link";

import type { UserCollectionsList } from "@/lib/actions/collections";
import { getDesignThumbnailURL } from "@/lib/storage/util";

export function CollectionPreview({
	collection,
}: {
	collection: UserCollectionsList[number];
}) {
	return (
		<Link href={`/collections/${collection.id}`}>
			<div className="grid grid-cols-2 grid-rows-2 w-[18rem] h-[12rem] gap-1">
				{collection.collectionItems.slice(0, 4).map((item) => (
					<div key={item.design.id} className="first-of-type:row-span-2">
						<img
							className="w-full h-full object-cover rounded-lg"
							src={getDesignThumbnailURL(
								item.design.thumbnailFileStorageKey,
								1200,
							)}
							alt={item.design.id}
						/>
					</div>
				))}
			</div>
			<h2 className="font-semibold mt-2">{collection.name}</h2>
		</Link>
	);
}
