export function DashboardComingSoonPlaceholder({
	title,
	description,
}: {
	title: string;
	description?: string;
}) {
	return (
		<main className="relative flex h-[calc(100svh-3.5rem)] flex-col gap-4 md:gap-6">
			<div className="flex items-center justify-between pt-4 px-4 md:pt-8 md:px-8">
				<h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
			</div>
			<div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm mb-4 mx-4 md:mb-8 md:mx-8">
				<div className="flex flex-col items-center gap-1 text-center">
					<h3 className="text-lg font-bold">Coming Soon</h3>
					<p className="text-sm text-muted-foreground">
						{description ?? "We're working on this page."}
					</p>
				</div>
			</div>
		</main>
	);
}
