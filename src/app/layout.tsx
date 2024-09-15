import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const manrope = Manrope({
	subsets: ["latin"],
	variable: "--font-manrope",
});

export const metadata: Metadata = {
	title: "Peach",
	description: "Get the latest TIFF layered textile design files from Peach",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${manrope.variable} font-sans`}>
				{children}
				<Toaster richColors theme="light" className="font-sans" />
			</body>
		</html>
	);
}
