import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getRelatedDesigns } from "@/lib/actions/designs";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import { cn } from "@/lib/utils";
import Link from "next/link";

export async function List({
	designId,
	className,
}: { designId: string; className?: string }) {
	const designs = await getRelatedDesigns(designId);

	if (designs.length === 0) {
		return <div className="h-[15.895625rem] w-full">&nbsp;</div>;
	}

	return (
		<div
			className={cn(
				"mt-4 space-y-2 border-t border-dashed border-t-foreground/20 pt-3",
				className,
			)}
		>
			<p className="text-sm font-medium">Related Designs</p>
			<ScrollArea className="w-full whitespace-nowrap">
				<div className="flex w-max gap-4">
					{designs.map((design) => (
						<Link
							key={design.id}
							href={`/d/${design.id}`}
							className="relative block overflow-hidden rounded-md w-[10rem] aspect-[3/4]"
							prefetch={false}
							target="_blank"
						>
							<img
								src={getDesignThumbnailURL(
									design.thumbnailFileStorageKey,
									1200,
								)}
								alt={design.name}
								className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
							/>
						</Link>
					))}
				</div>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
		</div>
	);
}

export function ListSkeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"mt-4 space-y-2 border-t border-dashed border-t-foreground/20 pt-3",
				className,
			)}
		>
			<p className="text-sm font-medium">Related Designs</p>
			<ScrollArea className="w-full whitespace-nowrap">
				<div className="flex w-max space-x-4">
					{Array.from({ length: 8 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<Skeleton key={i} className="w-[10rem] aspect-[3/4]" />
					))}
				</div>
			</ScrollArea>
		</div>
	);
}
