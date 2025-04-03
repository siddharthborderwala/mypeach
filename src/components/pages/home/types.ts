import type { getDesignsForExplore } from "@/lib/actions/designs";

export type InfiniteScrollDesignsProps = {
	initialData: Awaited<ReturnType<typeof getDesignsForExplore>>;
};

export type ExploreDesign =
	InfiniteScrollDesignsProps["initialData"]["designs"][number];
