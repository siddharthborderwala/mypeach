import { Suspense, useState } from "react";
import { List, ListSkeleton } from "./related-designs-mini-list";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function RelatedDesignsMiniList({
	className,
	designId,
}: {
	className?: string;
	designId: string;
}) {
	const [shouldShow, setShouldShow] = useState(false);

	return shouldShow ? (
		<Suspense fallback={<ListSkeleton className={className} />}>
			<List designId={designId} className={className} />
		</Suspense>
	) : (
		<div
			className={cn(
				"mt-4 space-y-2 border-t border-dashed border-t-foreground/20 pt-3 h-[15.895625rem] w-full flex items-center justify-center",
				className,
			)}
		>
			<Button
				size="sm"
				className="text-sm"
				variant="outline"
				onClick={() => setShouldShow(true)}
			>
				Show Similar
			</Button>
		</div>
	);
}
