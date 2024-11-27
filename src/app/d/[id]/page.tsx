import { Header } from "@/components/header";
import { DesignCard } from "@/components/pages/home/design-card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { getDesignByIdForExplore } from "@/lib/actions/designs";
import { getDesignSocialImageURL } from "@/lib/storage/util";
import { formatPrice, mimeToExtension } from "@/lib/utils";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

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
			<main className="bg-white w-full px-4 md:py-6 md:px-8">
				<Alert variant="info" className="max-w-md mx-auto">
					<WarningCircle weight="bold" className="h-4 w-4" />
					<AlertTitle>Coming Soon</AlertTitle>
					<AlertDescription>
						This is a early version of the design page.
					</AlertDescription>
				</Alert>
				<div className="max-w-md mx-auto flex items-center justify-center mt-8">
					<DesignCard design={design} className="w-full sm:w-4/5" />
				</div>
			</main>
		</>
	);
}
