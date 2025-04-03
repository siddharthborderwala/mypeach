import { Header } from "@/components/header";
import { Actions } from "@/components/pages/home/actions";
import { AddToCartButton } from "@/components/pages/home/add-to-cart-button";
import { getDesignByIdForExplore } from "@/lib/actions/designs";
import { getDesignSocialImageURL } from "@/lib/storage/util";
import { cn, formatPrice, mimeToExtension } from "@/lib/utils";
import type { Metadata } from "next";
import { ShareDesignButton } from "./share-design-button";
import { ZoomedImage } from "./zoomed-image";
import { getUserAuth } from "@/lib/auth/utils";

export async function generateMetadata({
	params,
}: {
	params: {
		id: string;
	};
}): Promise<Metadata> {
	// read route params
	const id = params.id;

	// fetch data
	const design = await getDesignByIdForExplore(id);

	const type = mimeToExtension(design.originalFileType).toUpperCase();

	return {
		title: `Get ${type} File (${design.fileDPI} DPI) on Peach`,
		description: `Buy this design in ${type} format (${design.fileDPI} DPI) for ${formatPrice(design.price)} only on Peach - the best place to get TIFF layered textile design files.`,
		openGraph: {
			images: {
				url: getDesignSocialImageURL(design.id),
				width: 900,
				height: 1200,
			},
		},
		twitter: {
			images: {
				url: getDesignSocialImageURL(design.id),
				width: 900,
				height: 1200,
			},
		},
	};
}

export default async function DesignPage({
	params,
	searchParams,
}: {
	params: { id: string };
	searchParams: { from?: string };
}) {
	const { session } = await getUserAuth();
	const design = await getDesignByIdForExplore(params.id);

	return (
		<>
			<Header
				showBackButton={searchParams.from === "explore"}
				className={cn(
					"max-sm:bg-transparent max-sm:backdrop-blur-0 max-sm:fixed max-sm:w-full max-sm:[&>div>nav]:bg-background max-sm:[&>div>nav]:border max-sm:[&>div>nav]:rounded-md max-sm:[&>div>nav]:p-0.5",
					session?.user.id
						? "max-sm:[&>div>nav]:flex-none"
						: "max-sm:[&>div>nav>button:nth-of-type(2)]:hidden",
				)}
			/>
			<main className="bg-white w-full md:px-8 mb-24">
				<div className="relative overflow-y-auto w-full">
					<div className="max-sm:border max-sm:rounded-xl sm:flex">
						<div className="sm:flex-[2] lg:flex-1">
							<ZoomedImage
								thumbnailFileStorageKey={design.thumbnailFileStorageKey}
								name={design.name}
							>
								<Actions
									design={design}
									share={false}
									saveBtnClassName="sm:hidden px-3 py-1 h-auto absolute bottom-3 right-4 font-medium"
								/>
							</ZoomedImage>
						</div>
						<div className="sm:flex-[2] lg:flex-1">
							<div className="sm:max-w-md p-4 sm:py-0 sm:px-8">
								<div className="flex justify-between">
									<div className="flex flex-col font-semibold">
										<p className="text-xl">{design.name}</p>
										<p>
											<span className="uppercase text-primary">
												{mimeToExtension(design.originalFileType)}
											</span>
											<span className="text-muted-foreground ml-1">
												({design.fileDPI} DPI)
											</span>
										</p>
									</div>
									<p className="text-2xl text-foreground/90 font-semibold">
										{formatPrice(design.price)}
									</p>
								</div>
								<Actions
									design={design}
									share={false}
									saveBtnClassName="max-sm:hidden px-3 py-1 h-auto mt-2"
								/>
								<div className="hidden sm:flex flex-col gap-4 mt-24">
									<ShareDesignButton designId={design.id} />
									<AddToCartButton designId={design.id} />
								</div>
							</div>
						</div>
					</div>
					<div className="px-4 mt-4 sm:mt-6">
						<div className="flex items-center gap-2 mr-auto text-foreground/80">
							<p className="text-lg font-semibold">✨ More Designs</p>
						</div>
						<div className="border border-dashed h-40 rounded-lg flex items-center justify-center mt-4">
							<p className="text-muted-foreground text-sm">Coming Soon</p>
						</div>
					</div>
				</div>

				<div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 backdrop-blur-sm bg-background/10 flex gap-2 border-t">
					<ShareDesignButton designId={design.id} />
					<AddToCartButton
						designId={design.id}
						className="max-sm:h-11 flex-[2]"
					/>
				</div>
			</main>
		</>
	);
}
