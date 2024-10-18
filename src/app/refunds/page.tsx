import type * as React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/misc";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "Refund Policy | Peach",
	description:
		"Refund policy for Peach - the platform for buying and selling latest TIFF layered textile design files.",
};

const PolicyList = () => (
	<ol>
		<li>
			<h3>Introduction</h3>
			<p>
				Welcome to Peach (the "Marketplace"). This Refund Policy outlines the
				terms governing refunds for digital products purchased through our
				Marketplace. By making a purchase, you agree to the terms outlined in
				this policy.
			</p>
		</li>
		<li>
			<h3>Digital Products</h3>
			<p>
				All products sold on our Marketplace are digital files, specifically
				TIFF files, uploaded by independent designers ("Designers"). Once a
				purchase is completed, and the digital file has been downloaded, it is
				considered delivered and used.
			</p>
		</li>
		<li>
			<h3>No Refunds After Download</h3>
			<p>
				Due to the nature of digital products, we do not offer refunds once the
				digital file has been downloaded. Digital files are non-tangible,
				irrevocable goods that can be copied and distributed. Once access has
				been granted to the digital content, we cannot issue a refund.
			</p>
		</li>
		<li>
			<h3>Refunds Before Download</h3>
			<ul>
				<li>
					If you have purchased a digital product but have not yet downloaded
					it, you may be eligible for a refund.
				</li>
				<li>
					To request a refund before downloading the file, please contact our
					customer support team at{" "}
					<Button variant="link" className="p-0 h-auto w-auto !text-primary">
						<Link href="/support">support page</Link>
					</Button>{" "}
					within 14 days of purchase.
				</li>
				<li>Refund requests will be reviewed on a case-by-case basis.</li>
			</ul>
		</li>
		<li>
			<h3>Defective or Corrupted Files</h3>
			<ul>
				<li>
					If the digital file is defective, corrupted, or does not match the
					product description, please contact us within 7 days of purchase.
				</li>
				<li>
					We will verify the issue, and if confirmed, we will provide a
					replacement file or issue a refund.
				</li>
			</ul>
		</li>
		<li>
			<h3>Unauthorized Transactions</h3>
			<ul>
				<li>
					If you believe your account has been used for an unauthorized
					transaction, please notify us immediately.
				</li>
				<li>
					We will investigate the claim and take appropriate action, which may
					include issuing a refund.
				</li>
			</ul>
		</li>
		<li>
			<h3>Limitation of Liability</h3>
			<ul>
				<li>
					The Marketplace is a platform for Designers to sell their digital
					products. We are not liable for any damages arising from the use or
					inability to use the digital files.
				</li>
				<li>
					Designers are responsible for ensuring that their products do not
					infringe on any rights and are free from viruses or malware.
				</li>
			</ul>
		</li>
		<li>
			<h3>Legal Compliance</h3>
			<ul>
				<li>
					This Refund Policy is governed by the laws of India, including the
					Consumer Protection Act, of 2019.
				</li>
				<li>
					Nothing in this policy is intended to limit your statutory rights as a
					consumer under Indian law.
				</li>
			</ul>
		</li>
		<li>
			<h3>Changes to This Policy</h3>
			<p>
				We reserve the right to modify this Refund Policy at any time. Changes
				will be effective when posted on this page with a new effective date.
			</p>
		</li>
		<li>
			<h3>Contact Us</h3>
			<p>
				If you have any questions or concerns about this Refund Policy, please
				refer to the{" "}
				<Button variant="link" className="p-0 h-auto w-auto !text-primary">
					<Link href="/support">support page</Link>
				</Button>
				.
			</p>
		</li>
	</ol>
);

export default function TermsPage() {
	return (
		<>
			<Header />
			<main className="relative p-4 md:gap-6 md:p-8 mx-auto max-w-3xl">
				<h1 className="text-2xl font-semibold">Refund Policy</h1>
				<h2 className="text-sm font-medium text-primary mt-2">
					Last updated at 18<sup>th</sup> October 2024
				</h2>
				<div className="prose mt-8 w-full">
					<PolicyList />
					<p className="text-sm my-8 text-muted-foreground">
						Please note: This Refund Policy is provided for informational
						purposes only and does not constitute legal advice. It is
						recommended that you consult with a legal professional to ensure
						that your refund policy complies with all applicable laws and
						regulations.
					</p>
				</div>
			</main>
		</>
	);
}
