import type { Metadata } from "next";
import { parseAsBoolean } from "nuqs";
import { Dialog } from "@/components/ui/dialog";
import { getCurrentUserDesigns } from "@/lib/actions/designs";
import { UploadProvider } from "@/components/pages/dashboard/designs/upload-context";
import { AllDesigns } from "./all-designs";
import { z } from "zod";

export const metadata: Metadata = {
	title: "Designs | Peach",
};

type PageProps = {
	searchParams: {
		new?: string | string[];
		q?: string;
	};
};

const searchParamsSchema = z.object({
	new: z
		.string()
		.optional()
		.transform((value) => value === "true"),
	q: z.string().optional(),
});

export default async function Designs({ searchParams }: PageProps) {
	const result = searchParamsSchema.safeParse(searchParams);

	const data = await getCurrentUserDesigns({
		search: result.success ? result.data.q : null,
	});

	return (
		<UploadProvider>
			<Dialog defaultOpen={result.success ? result.data.new : false}>
				<AllDesigns initialData={data} />
			</Dialog>
		</UploadProvider>
	);
}
