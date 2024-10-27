"use client";

import { NewDesignModal } from "@/components/pages/dashboard/designs/new-design-modal";
import EditDesignSheet from "@/components/pages/dashboard/designs/edit-design-sheet";
import NewDesignModalTrigger from "@/components/pages/dashboard/designs/new-design-modal/new-design-modal-trigger";
import { ScrollArea } from "@/components/ui/scroll-area";
import InfiniteScrollDesigns from "@/components/pages/dashboard/designs/infinite-scroll-designs-view";
import type { InfiniteScrollDesignsProps } from "@/hooks/dashboard";
import { useGetDesigns } from "@/hooks/dashboard";
import { useEffect, useState } from "react";
import { useUploadContext } from "@/components/pages/dashboard/designs/upload-context";
import type { DesignData } from "@/lib/actions/designs";
import { parseAsString, useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass, PaintBrush, SmileyMeh } from "@phosphor-icons/react";
import { useDebounce } from "@/hooks/use-debounce";

function SearchInput() {
	const [search, setSearch] = useQueryState("q", parseAsString);

	return (
		<div className="w-full max-w-sm relative">
			<Input
				name="q"
				placeholder="Enter design name or tags..."
				className="pl-10"
				value={search ?? ""}
				onChange={(e) => {
					if (e.target.value === "") {
						setSearch(null);
					} else {
						setSearch(e.target.value);
					}
				}}
			/>
			<MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
		</div>
	);
}

export function AllDesigns({ initialData }: InfiniteScrollDesignsProps) {
	const [search, setSearch] = useQueryState("q", parseAsString);

	const debouncedSearch = useDebounce(search, 250);

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
		search: debouncedSearch,
	});

	const designs = allDesigns.pages.flatMap((page) => page.designs);

	return (
		<main className="relative flex h-[calc(100svh-3.5rem)] flex-col gap-4 md:gap-6">
			<div className="flex items-center justify-between pt-4 px-4 md:pt-8 md:px-8">
				<h1 className="text-lg font-semibold md:text-2xl">Your Designs</h1>
				<div className="flex items-center gap-2">
					<SearchInput />
					<NewDesignModalTrigger />
				</div>
			</div>
			{designs.length === 0 ? (
				<div className="mb-4 mx-4 md:mb-8 md:mx-8 flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
					<div className="flex flex-col items-center gap-1 text-center">
						{debouncedSearch ? (
							<SmileyMeh className="text-muted-foreground" size={48} />
						) : (
							<PaintBrush className="text-muted-foreground" size={48} />
						)}
						<h3 className="text-2xl font-bold tracking-tight mt-4">
							{debouncedSearch ? "Oops" : "You have no designs"}
						</h3>
						<p className="text-sm text-muted-foreground">
							{debouncedSearch
								? "No designs found for your search!"
								: "You can start selling as soon as you add a design."}
						</p>
						{debouncedSearch ? (
							<Button
								variant="outline"
								className="mt-4"
								onClick={() => setSearch(null)}
							>
								View All
							</Button>
						) : (
							<NewDesignModalTrigger className="mt-4" />
						)}
					</div>
				</div>
			) : (
				<ScrollArea>
					<div className="pb-4 px-4 md:pb-8 md:px-8">
						<InfiniteScrollDesigns
							designs={designs as DesignData[]}
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
