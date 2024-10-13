import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUserAuth } from "@/lib/auth/utils";
import { UserMenu } from "@/components/user-menu";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { SearchBar } from "@/components/pages/home/search-bar";
import { DesignsGrid } from "@/components/pages/home/designs-grid";
import { getDesignsForExplore } from "@/lib/actions/designs";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Peach",
	description:
		"Buy and sell the latest TIFF layered textile design files from Peach",
};

async function Explore({ search }: { search: string | null | undefined }) {
	const designs = await getDesignsForExplore({
		search,
	});

	return <DesignsGrid initialData={designs} />;
}

export default async function LandingPage({
	searchParams,
}: {
	searchParams: {
		q?: string;
	};
}) {
	return (
		<>
			<main className="bg-white w-full px-4 md:py-6 md:px-8">
				<Suspense fallback={<div>Loading designs...</div>}>
					<Explore search={searchParams.q} />
				</Suspense>
			</main>
		</>
	);
}
