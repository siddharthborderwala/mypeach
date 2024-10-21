import type * as React from "react";
import type { Metadata } from "next";
import { Envelope, Phone, MapPinLine } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export const metadata: Metadata = {
	title: "Support | Peach",
	description:
		"Get help with Peach - the platform for buying and selling latest TIFF layered textile design files.",
};

// Add this array outside of the component
const faqItems: { question: string; answer: React.ReactNode }[] = [
	{
		question: "How do I reset my password?",
		answer: (
			<>
				You can reset your password by clicking on the "Forgot Password" link on
				the{" "}
				<Button variant="link" className="p-0 h-auto" asChild>
					<Link href="/login">login</Link>
				</Button>{" "}
				page. Follow the instructions sent to your email to create a new
				password.
			</>
		),
	},
	{
		question: "How long does it take to process a payout?",
		answer: (
			<>
				Payouts are typically processed within 3-5 business days. The exact time
				may vary depending on your bank and location.
			</>
		),
	},
	{
		question: "How do I list a new item for sale?",
		answer: (
			<>
				To list a new item, go to your seller dashboard and click on "Add New
				Listing". Fill in the required details such as title, description,
				price, and photos. Once you're satisfied, click "Publish" to make your
				item visible to buyers.
			</>
		),
	},
	{
		question: "What fees does Peach charge?",
		answer: (
			<>
				Peach charges a 20% commission on each sale. This fee covers payment
				processing, customer support, and platform maintenance. There are no
				listing fees or monthly charges.
			</>
		),
	},
	{
		question: "How are disputes handled?",
		answer: (
			<>
				If a dispute arises, both the buyer and seller can open a case through
				our resolution center. Our support team will review the details and
				mediate to find a fair solution. We encourage communication between
				parties to resolve issues amicably when possible.
			</>
		),
	},
	{
		question: "What are your terms and conditions?",
		answer: (
			<>
				Please refer to our
				<Button variant="link" className="p-0 h-auto mx-1" asChild>
					<Link href="/terms">terms and conditions</Link>
				</Button>
				page.
			</>
		),
	},
	{
		question: "Can I get a refund?",
		answer: (
			<>
				Please refer to our
				<Button variant="link" className="p-0 h-auto mx-1" asChild>
					<Link href="/refunds">refunds</Link>
				</Button>
				page.
			</>
		),
	},
	{
		question: "What information do we collect? (Privacy Policy)",
		answer: (
			<>
				Please refer to our
				<Button variant="link" className="p-0 h-auto mx-1" asChild>
					<Link href="/privacy-policy">privacy policy</Link>
				</Button>
				page.
			</>
		),
	},
];

export default function SupportPage() {
	return (
		<>
			<Header />
			<main className="relative p-4 md:gap-6 md:p-8 mx-auto max-w-5xl">
				<div className="space-y-2">
					<h1 className="text-lg font-semibold md:text-2xl">Support</h1>
					<p className="text-sm text-muted-foreground">
						We're here to help you
					</p>
				</div>
				<div className="mt-4 grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Envelope className="h-5 w-5" />
								Email Support
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-lg font-medium">support@mypeach.com</p>
							<p className="text-sm text-muted-foreground mt-2">
								We typically respond within 24 hours.
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Phone className="h-5 w-5" />
								WhatsApp Support
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex">
								<p className="text-lg font-medium">+91 75678 10000</p>
							</div>
							<p className="text-sm text-muted-foreground mt-2">
								Available Monday to Saturday, 9 AM - 9 PM IST
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPinLine className="h-5 w-5" />
								Office Address
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p>
								B-1103, Rajhans Zion, Canal Road, Vesu, Surat, Gujarat - 395007
							</p>
						</CardContent>
					</Card>
				</div>
				<div className="mt-8 max-w-lg">
					<h2 className="text-xl font-semibold mb-4">
						Frequently Asked Questions
					</h2>
					<Accordion type="single" collapsible className="w-full">
						{faqItems.map((item, index) => (
							<AccordionItem
								key={`item-${index + 1}`}
								value={`item-${index + 1}`}
							>
								<AccordionTrigger>{item.question}</AccordionTrigger>
								<AccordionContent>{item.answer}</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</main>
		</>
	);
}
