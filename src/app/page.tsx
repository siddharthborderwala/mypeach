import Link from "next/link";
import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth/lucia";

export default async function LandingPage() {
	const { session } = await validateRequest();

	return (
		<div className="flex items-center justify-between p-4">
			<div className="flex items-center">
				<img src="/favicon.ico" alt="logo" className="h-10 w-10" />
				<p className="text-black text-3xl font-bold tracking-tight">Peach</p>
			</div>
			<Button asChild>
				<Link href={session?.userId ? "/home" : "/register"}>
					{session?.userId ? "Dashboard" : "Start Selling"}
				</Link>
			</Button>
		</div>
	);
}
