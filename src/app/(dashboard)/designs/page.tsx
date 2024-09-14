import { Button } from "@/components/ui/button";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function Designs() {
	return (
		<main className="flex h-[calc(100svh-3.5rem)] flex-col gap-4 p-4 lg:gap-6 lg:p-6">
			<div className="flex items-center">
				<h1 className="text-lg font-semibold md:text-2xl">Your Designs</h1>
			</div>
			<div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
				<div className="flex flex-col items-center gap-1 text-center">
					<h3 className="text-2xl font-bold tracking-tight">
						You have no designs
					</h3>
					<p className="text-sm text-muted-foreground">
						You can start selling as soon as you add a design.
					</p>
					<Button className="mt-4 gap-2" asChild>
						<Link href="/designs/new">
							<Plus weight="bold" className="h-4 w-4" />
							Add Design
						</Link>
					</Button>
				</div>
			</div>
		</main>
	);
}
