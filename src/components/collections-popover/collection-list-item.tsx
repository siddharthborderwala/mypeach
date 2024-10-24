import type { UserCollectionsList } from "@/lib/actions/collections";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import { Button } from "../ui/button";

export function CollectionListItem({
	collection,
	onClick,
	disabled,
}: {
	collection: UserCollectionsList[number];
	onClick: (collectionId: string) => void;
	disabled?: boolean;
}) {
	return (
		<Button
			variant="ghost"
			className="flex items-center justify-between"
			onClick={() => onClick(collection.id)}
			disabled={disabled}
		>
			<img
				src={getDesignThumbnailURL(
					collection.collectionItems[0]?.design.thumbnailFileStorageKey ?? "",
					1200,
				)}
				alt={collection.name}
			/>
			<div>
				<h3 className="font-semibold">{collection.name}</h3>
				<p className="text-sm text-muted-foreground">
					{collection.collectionItems.length} designs
				</p>
			</div>
		</Button>
	);
}
