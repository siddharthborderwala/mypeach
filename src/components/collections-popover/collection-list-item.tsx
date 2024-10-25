import { Check } from "@phosphor-icons/react";
import type { UserCollectionsList } from "@/lib/actions/collections";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import { Button } from "../ui/button";
import ImageWithFallback from "../image-with-fallback";

export function CollectionListItem({
	collection,
	onClick,
	disabled,
	isSelected,
}: {
	collection: UserCollectionsList[number];
	onClick: (collectionId: string) => void;
	isSelected: boolean;
	disabled?: boolean;
}) {
	return (
		<Button
			variant="ghost"
			onClick={() => onClick(collection.id)}
			disabled={disabled}
			className="flex items-center justify-start gap-2 p-2 h-auto w-full overflow-hidden"
		>
			<div className="w-10 h-12">
				<ImageWithFallback
					src={getDesignThumbnailURL(
						collection.collectionItems[0]?.design.thumbnailFileStorageKey ?? "",
						1200,
					)}
					alt={collection.name}
					width={40}
					className="rounded w-full h-full object-cover"
				/>
			</div>
			<div className="text-left">
				<h3 className="font-semibold">{collection.name}</h3>
				<p className="text-sm text-muted-foreground font-normal">
					{collection.collectionItems.length} designs
				</p>
			</div>
			{isSelected ? (
				<div className="ml-auto h-4 w-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
					<Check weight="bold" className="w-3 h-3" />
				</div>
			) : null}
		</Button>
	);
}
