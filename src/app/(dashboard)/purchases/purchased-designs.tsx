"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { InfiniteScrollPurchasedDesignsProps } from "@/hooks/dashboard";
import { useGetPurchasedDesigns } from "@/hooks/dashboard";
import type { DesignData } from "@/lib/actions/designs";
import { Button } from "@/components/ui/button";
import InfiniteScrollPurchasedDesigns from "@/components/pages/dashboard/purchases/infinite-scroll-purchased-designs-view";
import Link from "next/link";

export function PurchasedDesigns({
	initialData,
}: InfiniteScrollPurchasedDesignsProps) {
	const {
		data: allDesigns,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status,
	} = useGetPurchasedDesigns({
		initialData,
	});

	// Flatten the pages into a single array of designs
	const designs = allDesigns.pages
		.flatMap((page) => page.designs)
		.filter(
			(design, index, self) =>
				self.findIndex((d) => d.id === design.id) === index,
		);

	return (
		<main className="relative flex h-[calc(100svh-3.5rem)] flex-col gap-4 md:gap-6">
			<div className="flex items-center justify-between pt-4 px-4 md:pt-8 md:px-8">
				<h1 className="text-lg font-semibold md:text-2xl">Your Purchases</h1>
			</div>
			{designs.length === 0 ? (
				<div className="mb-4 mx-4 md:mb-8 md:mx-8 flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
					<div className="flex flex-col items-center gap-1 text-center">
						<h3 className="text-2xl font-bold tracking-tight mt-4">
							You have no purchases
						</h3>
						<p className="text-sm text-muted-foreground">
							You can purchase designs from the marketplace.
						</p>
						<Button className="mt-4" asChild>
							<Link href="/">Explore Marketplace</Link>
						</Button>
					</div>
				</div>
			) : (
				<ScrollArea>
					<div className="pb-4 px-4 md:pb-8 md:px-8">
						<InfiniteScrollPurchasedDesigns
							designs={designs as DesignData[]}
							fetchNextPage={fetchNextPage}
							hasNextPage={hasNextPage}
							isFetchingNextPage={isFetchingNextPage}
							status={status}
						/>
					</div>
				</ScrollArea>
			)}
		</main>
	);
}
