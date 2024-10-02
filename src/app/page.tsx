import { CommonHeader } from "@/components/common-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateRequest } from "@/lib/auth/lucia";
import Link from "next/link";

async function CTA() {
	const { session } = await validateRequest();

	return session?.userId ? (
		<Button asChild className="mt-8 px-7 w-min">
			<Link href="/home">View Dashboard</Link>
		</Button>
	) : (
		<form
			action="/login"
			method="GET"
			className="flex mt-6 flex-col w-full max-w-md"
		>
			<Input type="text" name="email" placeholder="Enter your email" />
			<Button className="mt-4 px-7 w-min">Get Started</Button>
		</form>
	);
}
export default function LandingPage() {
	return (
		<>
			<CommonHeader />
			<main className="flex items-center w-full h-[70svh] px-4 md:py-6 md:px-8">
				<section className="w-full max-w-7xl mx-auto">
					<h1 className="text-5xl font-bold leading-tight">
						Start selling your <br />
						<span className="text-primary">textile designs</span>
					</h1>
					<CTA />
				</section>
			</main>
		</>
	);
}
