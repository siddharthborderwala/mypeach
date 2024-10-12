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
	const { session } = await getUserAuth();

	return (
		<>
			<header className="sticky top-0 bg-white">
				{session?.user.id ? (
					<div className="flex items-center justify-between md:gap-6 p-4">
						<div className="flex-1">
							<Link
								href="/"
								className="w-min flex items-center gap-1 font-medium"
							>
								<img src="/logo.png" alt="Peach" className="h-10 w-10" />
								<span className="text-xl mt-1">Peach</span>
							</Link>
						</div>
						<div className="flex-1">
							<SearchBar />
						</div>
						<div className="flex-1 flex items-center justify-end gap-4">
							<Button
								asChild
								size="sm"
								variant="outline"
								className="text-sm font-normal gap-2 items-center"
							>
								<Link href="/designs?new=true">
									<span>Create</span>
									<Plus weight="bold" />
								</Link>
							</Button>
							<UserMenu
								userId={session.user.id}
								username={session.user.username}
							/>
						</div>
					</div>
				) : (
					<div className="flex items-center justify-between md:gap-6 p-4">
						<Link href="/" className="flex items-center gap-1 font-semibold">
							<img src="/logo.png" alt="Peach" className="h-10 w-10" />
							<span className="text-xl mt-1">Peach</span>
						</Link>
						<nav className="flex items-center gap-4">
							<Link href="/#explore">Explore</Link>
							<Link href="/login">Login</Link>
							<Link href="/register">Register</Link>
						</nav>
					</div>
				)}
			</header>
			<main className="bg-white w-full px-4 md:py-6 md:px-8">
				<Suspense fallback={<div>Loading designs...</div>}>
					<Explore search={searchParams.q} />
				</Suspense>
			</main>
		</>
	);
}
