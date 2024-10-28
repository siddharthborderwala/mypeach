import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { FlashToast } from "@/components/flash-toast";

import "./globals.css";
import { GlobalQueryClient } from "./global-query-client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { validateRequest } from "@/lib/auth/lucia";
import { AuthProvider } from "@/contexts/auth";

const manrope = Manrope({
	subsets: ["latin"],
	variable: "--font-manrope",
});

export const metadata: Metadata = {
	title: "Peach",
	description: "Get the latest TIFF layered textile design files from Peach",
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
						<Toaster richColors theme="light" className="font-sans" />
						<FlashToast />
					</TooltipProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
