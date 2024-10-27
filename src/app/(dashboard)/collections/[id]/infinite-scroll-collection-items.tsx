import { InfiniteQueryBottom } from "@/components/infinite-query-bottom";
import { DesignCardView } from "@/components/pages/home/design-card-view";
import { Button } from "@/components/ui/button";
import type { CollectionDesign } from "@/lib/actions/collections";
import { CheckCircle, Circle } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export function InfiniteScrollCollectionItems({
	collectionItems,
	fetchNextPage,
	hasNextPage,
	isFetchingNextPage,
	status,
	isSelectDesignsMode,
	onDesignToggle,
	selectedDesigns,
}: {
	collectionItems: CollectionDesign[];
	fetchNextPage: () => void;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	status: string;
	isSelectDesignsMode: boolean;
	onDesignToggle: (designId: string) => void;
	selectedDesigns: string[];
}) {
	const { ref, inView } = useInView();

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	if (status === "error") return <div>Error loading collections</div>;

	return (
		<>
			<div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]">
				{collectionItems.map((design) =>
					isSelectDesignsMode ? (
						<Button
							variant="ghost"
							key={design.id}
							className="text-left h-auto p-0 relative block"
							onClick={() => onDesignToggle(design.id)}
						>
							<div className="[&>div>img]:scale-75">
								<DesignCardView design={design} details="collection-view" />
							</div>
							{selectedDesigns.includes(design.id) ? (
								<CheckCircle
									className="w-6 h-6 absolute top-2 right-2 text-primary"
									weight="fill"
									aria-hidden="true"
								/>
							) : (
								<Circle
									className="w-6 h-6 absolute top-2 right-2 text-primary"
									aria-hidden="true"
								/>
							)}
						</Button>
					) : (
						<Link
							key={design.id}
							href={`/d/${design.id}`}
							prefetch={false}
							target="_blank"
						>
							<DesignCardView design={design} details="collection-view" />
						</Link>
					),
				)}
			</div>
			<InfiniteQueryBottom
				ref={ref}
				label="designs"
				isFetchingNextPage={isFetchingNextPage}
				hasNextPage={hasNextPage}
			/>
		</>
	);
}
