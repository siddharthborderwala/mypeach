import type { Metadata } from "next";

import { NewDesignModal } from "@/components/pages/home/new-design-modal";
import { Dialog } from "@/components/ui/dialog";
import { getCurrentUserDesigns } from "@/lib/actions/designs";
import DesignPreview from "@/components/pages/home/design-preview";
import EditDesignSheet from "@/components/pages/home/edit-design-sheet";
import NewDesignModalTrigger from "@/components/pages/home/new-design-modal/new-design-modal-trigger";
import { UploadProvider } from "@/components/pages/home/upload-context";
import { ScrollArea } from "@/components/ui/scroll-area";

export const metadata: Metadata = {
	title: "Designs | Peach",
};

export default async function Designs() {
	const designs = await getCurrentUserDesigns();

	return (
		<UploadProvider>
			<Dialog>
				<main className="relative flex h-[calc(100svh-3.5rem)] flex-col gap-4 md:gap-6">
					<div className="flex items-center justify-between pt-4 px-4 md:pt-8 md:px-8">
						<h1 className="text-lg font-semibold md:text-2xl">Your Designs</h1>
						{designs.length > 0 ? <NewDesignModalTrigger /> : null}
					</div>
					{designs.length === 0 ? (
						<div className="pb-4 px-4 md:pb-8 md:px-8 flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
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
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
									{designs.map((design) => (
										<DesignPreview key={design.id} design={design} />
									))}
								</div>
								<EditDesignSheet />
							</div>
						</ScrollArea>
					)}
					<NewDesignModal />
				</main>
			</Dialog>
		</UploadProvider>
	);
}
