import { forwardRef } from "react";

export const InfiniteQueryBottom = forwardRef<
	HTMLDivElement,
	{
		label: string;
		isFetchingNextPage: boolean;
		hasNextPage: boolean;
	}
>(({ label, isFetchingNextPage, hasNextPage }, ref) => {
	return (
		<div
			ref={ref}
			className="flex items-center justify-center mt-24 mb-12 w-full"
		>
			{isFetchingNextPage ? (
				<p className="text-sm text-muted-foreground">Loading more {label}...</p>
			) : hasNextPage ? null : (
				<p className="text-sm text-muted-foreground">
					That's all of the {label}
				</p>
			)}
		</div>
	);
});
