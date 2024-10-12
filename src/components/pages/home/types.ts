import type { getDesignsForExplore } from "@/lib/actions/designs";

export type InfiniteScrollDesignsProps = {
	initialData: Awaited<ReturnType<typeof getDesignsForExplore>>;
};
