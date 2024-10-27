import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AddDesigns() {
	return (
		<div className="flex gap-2 mt-4">
			<Button variant="outline" asChild>
				<Link href="/designs">My Designs</Link>
			</Button>
			<Button asChild>
				<Link href="/">Explore</Link>
			</Button>
		</div>
	);
}
