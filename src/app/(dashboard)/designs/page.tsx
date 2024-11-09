import type { Metadata } from "next";
import { Dialog } from "@/components/ui/dialog";
import { getCurrentUserDesigns } from "@/lib/actions/designs";
import { UploadProvider } from "@/components/pages/dashboard/designs/upload-context";
import { AllDesigns } from "./all-designs";
import { z } from "zod";
import { VendorNotFound } from "@/components/vendor-not-found";

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

	try {
		// Attempt to get the designs data
		const data = await getCurrentUserDesigns({
			search: result.success ? result.data.q : null,
		});

		// If successful, render the AllDesigns component with the data
		return (
			<UploadProvider>
				<Dialog defaultOpen={result.success ? result.data.new : false}>
					<AllDesigns initialData={data} />
				</Dialog>
			</UploadProvider>
		);
	} catch (error) {
		// Check if the error is "Vendor not found"
		if (error instanceof Error && error.message === "Vendor not found") {
			// Return early with the VendorOnboardingModal
			return (
				<UploadProvider>
					<VendorNotFound title="Your Designs" />
				</UploadProvider>
			);
		}
		// Re-throw any other errors to be handled elsewhere
		throw error;
	}
}
