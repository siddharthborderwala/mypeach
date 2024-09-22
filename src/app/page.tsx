import Link from "next/link";
import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth/lucia";

export default async function LandingPage() {
	const { session } = await validateRequest();

	return (
		<div className="flex items-center justify-between px-5 py-3">
			<Link href="/" className="flex items-center gap-1 font-semibold">
				<img src="/favicon.ico" alt="Peach" className="h-10 w-10" />
				<span className="text-xl mt-1">Peach</span>
			</Link>
			<Button asChild className="h-auto py-1.5">
				<Link href={session?.userId ? "/home" : "/register"}>
					{session?.userId ? "Dashboard" : "Start Selling"}
				</Link>
			</Button>
		</div>
	);
}
