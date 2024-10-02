import { CommonHeader } from "@/components/common-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
					{/* <p className="text-lg font-medium mt-8 text-muted-foreground">
						Peach is a platform that allows you to sell your textile designs to
						anyone.
					</p> */}
					<div className="flex mt-4 flex-col w-full max-w-md">
						<Input type="text" placeholder="Enter your email" />
						<Button className="mt-4 px-7 w-min">Get Started</Button>
					</div>
				</section>
			</main>
		</>
	);
}
