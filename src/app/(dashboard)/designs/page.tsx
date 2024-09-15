import { Plus } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import { NewDesignModal } from "@/components/new-design-modal";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { getCurrentUserDesigns } from "@/lib/actions/designs";
import { getFileURL } from "@/lib/storage/util";

export default async function Designs() {
	const designs = await getCurrentUserDesigns();

	return (
		<Dialog>
			<main className="relative flex h-[calc(100svh-3.5rem)] flex-col gap-4 p-4 md:gap-6 md:p-8">
				<div className="flex items-center justify-between">
					<h1 className="text-lg font-semibold md:text-2xl">Your Designs</h1>
					{designs.length > 0 ? (
						<DialogTrigger asChild>
							<Button className="gap-2">
								<Plus weight="bold" className="h-4 w-4" />
								Add Design
							</Button>
						</DialogTrigger>
					) : null}
				</div>
				{designs.length === 0 ? (
					<div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
						<div className="flex flex-col items-center gap-1 text-center">
							<h3 className="text-2xl font-bold tracking-tight">
								You have no designs
							</h3>
							<p className="text-sm text-muted-foreground">
								You can start selling as soon as you add a design.
							</p>
							<DialogTrigger asChild>
								<Button className="mt-4 gap-2">
									<Plus weight="bold" className="h-4 w-4" />
									Add Design
								</Button>
							</DialogTrigger>
						</div>
					</div>
				) : (
					<div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
							{designs.map((design) => (
								<div
									key={design.id}
									className="border rounded-lg p-4 shadow-sm"
								>
									<object
										type="image/webp"
										data={getFileURL(design.thumbnailFileStorageKey ?? "")}
										width="100%"
										className="aspect-square flex items-center justify-center"
									>
										<img
											src="/favicon.ico"
											alt=""
											width="60"
											height="60"
											className="filter grayscale"
										/>
									</object>
									<div className="flex flex-col gap-1 mt-2">
										<h3 className="font-semibold truncate">{design.name}</h3>
										<p className="text-sm text-muted-foreground truncate">
											{design.originalFileName}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
				<NewDesignModal />
			</main>
		</Dialog>
	);
}
