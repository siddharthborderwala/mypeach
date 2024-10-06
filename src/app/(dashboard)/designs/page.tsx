import type { Metadata } from "next";
import { parseAsBoolean } from "nuqs";
import { Dialog } from "@/components/ui/dialog";
import { getCurrentUserDesigns } from "@/lib/actions/designs";
import { UploadProvider } from "@/components/pages/designs/upload-context";
import { AllDesigns } from "./all-designs";

export const metadata: Metadata = {
	title: "Designs | Peach",
};

type PageProps = {
	searchParams: {
		new?: string | string[];
	};
};

const newParser = parseAsBoolean.withDefault(false);

export default async function Designs({ searchParams }: PageProps) {
	const data = await getCurrentUserDesigns();
	const newDesign = newParser.parseServerSide(searchParams.new);

	return (
		<UploadProvider>
			<Dialog defaultOpen={newDesign}>
				<AllDesigns initialData={data} />
			</Dialog>
		</UploadProvider>
	);
}
