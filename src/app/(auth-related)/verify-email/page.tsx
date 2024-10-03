import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

import { SealCheck, SealWarning } from "@phosphor-icons/react/dist/ssr";
import { verifyEmailVerificationToken } from "@/lib/auth/verification";
import { Button } from "@/components/ui/button";

type VerifyEmailProps = {
	searchParams: {
		token?: string;
	};
};

export const metadata: Metadata = {
	title: "Verify Email | Peach",
};

export default async function VerifyEmail({ searchParams }: VerifyEmailProps) {
	if (!searchParams.token) {
		redirect("/login");
	}

	const isValidToken = await verifyEmailVerificationToken(searchParams.token);

	if (isValidToken) {
		return (
			<div className="flex items-center justify-center py-12 px-4 w-full h-full">
				<section className="grid gap-6 max-w-[400px] w-full">
					<SealCheck weight="fill" className="w-12 h-12 text-green-500" />
					<div className="grid gap-2">
						<h1 className="text-3xl font-bold">Email Verified</h1>
						<p className="text-balance text-muted-foreground">
							Your email has been verified.
						</p>
					</div>
					<Button asChild>
						<Link href="/home">View Dashboard</Link>
					</Button>
				</section>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center py-12 px-4 w-full h-full">
			<section className="grid gap-6 max-w-[400px] w-full">
				<SealWarning weight="fill" className="w-12 h-12 text-red-500" />
				<div className="grid gap-2">
					<h1 className="text-3xl font-bold">Verification Failed</h1>
					<p className="text-balance text-muted-foreground">
						Your email verification link is invalid or has expired.
					</p>
				</div>
				<Button asChild>
					<Link href="/account">Request Email Verification</Link>
				</Button>
			</section>
		</div>
	);
}
