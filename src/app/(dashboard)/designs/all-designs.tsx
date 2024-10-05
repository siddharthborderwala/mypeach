"use client";
import { NewDesignModal } from "@/components/pages/designs/new-design-modal";
import EditDesignSheet from "@/components/pages/designs/edit-design-sheet";
import NewDesignModalTrigger from "@/components/pages/designs/new-design-modal/new-design-modal-trigger";
import { ScrollArea } from "@/components/ui/scroll-area";
import InfiniteScrollDesigns from "@/components/pages/designs/infinite-scroll-designs-view";
import type { InfiniteScrollDesignsProps } from "@/hooks/dashboard";
import { useGetDesigns } from "@/hooks/dashboard";
import { useEffect, useMemo, useState } from "react";
import { useUploadContext } from "@/components/pages/designs/upload-context";

export function AllDesigns({ initialData }: InfiniteScrollDesignsProps) {
	const { newDesignIsUploaded, newDesignId } = useUploadContext();

	const [trackDesignIdForPreview, setTrackDesignIdForPreview] = useState<
		string | undefined
	>("");

	useEffect(() => {
		if (newDesignIsUploaded === true && newDesignId) {
			setTrackDesignIdForPreview(newDesignId);
		}
	}, [newDesignIsUploaded, newDesignId]);

	const {
		data: allDesigns,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
	} = useGetDesigns({
		initialData,
		trackDesignIdForPreview,
		setTrackDesignIdForPreview,
	});

	const designs = allDesigns.pages.flatMap((page) => page.designs);

	return (
		<main className="relative flex h-[calc(100svh-3.5rem)] flex-col gap-4 md:gap-6">
			<div className="flex items-center justify-between pt-4 px-4 md:pt-8 md:px-8">
				<h1 className="text-lg font-semibold md:text-2xl">Your Designs</h1>
				{designs.length > 0 ? <NewDesignModalTrigger /> : null}
			</div>
			{designs.length === 0 ? (
				<div className="mb-4 mx-4 md:mb-8 md:mx-8 flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
					<div className="flex flex-col items-center gap-1 text-center">
						<h3 className="text-2xl font-bold tracking-tight">
							You have no designs
						</h3>
						<p className="text-sm text-muted-foreground">
							You can start selling as soon as you add a design.
						</p>
						<NewDesignModalTrigger className="mt-4" />
					</div>
				</div>
			) : (
				<ScrollArea>
					<div className="pb-4 px-4 md:pb-8 md:px-8">
						<InfiniteScrollDesigns
							designs={designs}
							fetchNextPage={fetchNextPage}
							hasNextPage={hasNextPage}
							isFetchingNextPage={isFetchingNextPage}
							status={status}
						/>
						<EditDesignSheet />
					</div>
				</ScrollArea>
			)}
			<NewDesignModal />
		</main>
	);
}
