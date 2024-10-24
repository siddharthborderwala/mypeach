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
			onClick={() => onClick(collection.id)}
			disabled={disabled}
			className="flex items-center justify-start gap-2 p-2 h-auto w-full overflow-hidden"
		>
			<img
				src={getDesignThumbnailURL(
					collection.collectionItems[0]?.design.thumbnailFileStorageKey ?? "",
					1200,
				)}
				alt={collection.name}
				height={40}
				width={40}
				className="rounded"
			/>
			<div className="text-left">
				<h3 className="font-semibold">{collection.name}</h3>
				<p className="text-sm text-muted-foreground font-normal">
					{collection.collectionItems.length} designs
				</p>
			</div>
		</Button>
	);
}
