import { Header } from "@/components/header";
import ImageWithFallback from "@/components/image-with-fallback";
import { Actions } from "@/components/pages/home/actions";
import { AddToCartButton } from "@/components/pages/home/add-to-cart-button";
import { getDesignByIdForExplore } from "@/lib/actions/designs";
import {
	getDesignSocialImageURL,
	getDesignThumbnailURL,
} from "@/lib/storage/util";
import { formatPrice, mimeToExtension, relativeTime } from "@/lib/utils";
import type { Metadata } from "next";
import { ShareDesignButton } from "./share-design-button";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { ZoomedImage } from "./zoomed-image";

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
}: { params: { id: string } }) {
	const design = await getDesignByIdForExplore(params.id);

	return (
		<>
			<Header />
			<main className="bg-white w-full md:py-6 md:px-8 mb-48">
				<div className="relative overflow-y-auto w-full">
					<Button variant="outline" className="absolute top-4 left-4">
						<CaretLeft weight="bold" />
						<span className="sr-only">Back</span>
					</Button>
					<ZoomedImage
						thumbnailFileStorageKey={design.thumbnailFileStorageKey}
						name={design.name}
					/>
					<div className="flex justify-between mt-4 px-4">
						<div className="flex flex-col">
							<p className="text-2xl font-medium">{design.name}</p>
							<p className="font-bold">
								<span className="uppercase text-primary">
									{mimeToExtension(design.originalFileType)}
								</span>
								<span className="text-muted-foreground ml-1">
									({design.fileDPI} DPI)
								</span>
							</p>
						</div>
						<p className="text-2xl text-foreground/90 font-medium">
							{formatPrice(design.price)}
						</p>
					</div>
					<div className="px-4 mt-4 flex justify-between">
						<div className="flex flex-col mr-auto">
							<p className="font-medium">by {design.vendor.user.username}</p>
							<span
								suppressHydrationWarning
								className="text-xs text-muted-foreground"
							>
								Added {relativeTime(design.createdAt)}
							</span>
						</div>
						<Actions design={design} share={false} />
					</div>
				</div>

				<div className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-sm bg-background/80 border-t flex gap-2">
					<ShareDesignButton designId={design.id} />
					<AddToCartButton designId={design.id} className="h-12 flex-[2]" />
				</div>
			</main>
		</>
	);
}
