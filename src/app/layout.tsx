import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { FlashToast } from "@/components/flash-toast";

import { appBaseURL } from "@/lib/utils";
import { GlobalQueryClient } from "./global-query-client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { validateRequest } from "@/lib/auth/lucia";
import { AuthProvider } from "@/contexts/auth";

import "./globals.css";

const manrope = Manrope({
	subsets: ["latin"],
	variable: "--font-manrope",
});

const title = "Peach";
const description =
	"India's marketplace for the latest TIFF textile design files ✨";

export const metadata: Metadata = {
	title,
	description,
	openGraph: {
		title,
		description,
		images: [`${appBaseURL}/preview.jpg`],
		url: appBaseURL,
	},
	twitter: {
		card: "summary_large_image",
		title,
		description,
		images: [`${appBaseURL}/preview.jpg`],
		site: appBaseURL,
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const auth = await validateRequest();

	return (
		<html lang="en">
			<body className={`${manrope.variable} font-sans`}>
				<AuthProvider auth={auth}>
					<TooltipProvider delayDuration={150} skipDelayDuration={750}>
						<GlobalQueryClient>{children}</GlobalQueryClient>
						<Toaster
							richColors
							theme="light"
							duration={3000}
							className="font-sans"
						/>
						<FlashToast />
					</TooltipProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
