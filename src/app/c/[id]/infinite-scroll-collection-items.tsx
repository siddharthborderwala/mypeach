import { InfiniteQueryBottom } from "@/components/infinite-query-bottom";
import { DesignCard } from "@/components/pages/home/design-card";
import { Button } from "@/components/ui/button";
import type { CollectionDesign } from "@/lib/actions/collections";
import { CheckCircle, Circle } from "@phosphor-icons/react";
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
			<div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{collectionItems.map((design) =>
					isSelectDesignsMode ? (
						<Button
							variant="ghost"
							key={design.id}
							className="text-left h-auto p-0 relative block"
							onClick={() => onDesignToggle(design.id)}
						>
							<div className="[&>div>img]:scale-75">
								<DesignCard design={design} disableModal />
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
						<DesignCard key={design.id} design={design} />
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
