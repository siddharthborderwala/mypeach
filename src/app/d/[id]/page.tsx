import { getDesignByIdForExplore } from "@/lib/actions/designs";
import { getDesignSocialImageURL } from "@/lib/storage/util";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata(params: {
	id: string;
}): Promise<Metadata> {
	// read route params
	const id = params.id;

	// fetch data
	const design = await getDesignByIdForExplore(id);

	return {
		title: `${design.name} | Peach`,
		description: `Get ${design.name} for ${formatPrice(design.price)} only on Peach - the best place to get TIFF layered textile design files.`,
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

	return <pre>{JSON.stringify(design, null, 2)}</pre>;
}
