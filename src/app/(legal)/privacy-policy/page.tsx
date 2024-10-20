import type * as React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/misc";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "Privacy Policy | Peach",
	description:
		"Privacy policy for Peach - the platform for buying and selling latest TIFF layered textile design files.",
};

const PolicyList = () => {
	return (
		<ol>
			<li>
				<h3>Introduction</h3>
				<ul>
					<li>
						Welcome to Peach (the "Marketplace"). This Privacy Policy outlines
						how we collect, use, disclose, and protect your personal
						information. We are committed to safeguarding your privacy and
						ensuring the security of your personal data.
					</li>
					<li>
						By accessing or using our Marketplace, you agree to the terms and
						practices described in this Privacy Policy. If you do not agree with
						our policies and practices, please do not use our services.
					</li>
				</ul>
			</li>
			<li>
				<h3>Definitions</h3>
				<ul>
					<li>
						Personal Data: In the context of our services, personal data
						includes:
						<ol>
							<li>Name</li>
							<li>Email address</li>
							<li>Username</li>
							<li>Password (stored securely using encryption)</li>
							<li>
								Payment information (processed securely by third-party payment
								processors)
							</li>
							<li>IP address</li>
							<li>Website usage data</li>
						</ol>
						This information is collected directly from users or automatically
						through their use of our website.
					</li>
					<li>
						Sensitive Personal Data: We do not store any payment card data. All
						payment processing is handled by our third-party payment processor.
						For vendors, we securely store necessary payout information (e.g.,
						bank account details) to process payments for their sales.
					</li>
				</ul>
			</li>
			<li>
				<h3>Information Collection</h3>
				<ul>
					<li>
						Data Collected Directly: We collect personal data directly from
						users, including:
						<ul>
							<li>Name</li>
							<li>Email address</li>
							<li>Username</li>
							<li>Password (stored securely using encryption)</li>
							<li>
								Payment information (processed securely by third-party payment
								processors)
							</li>
						</ul>
					</li>
					<li>
						Data Collected Automatically: We collect some data automatically
						through your use of our website:
						<ul>
							<li>IP address</li>
							<li>Device information</li>
							<li>Browser type and version</li>
							<li>Operating system</li>
							<li>Session information (stored using cookies)</li>
							<li>Website usage data</li>
						</ul>
					</li>
					<li>
						Cookies: We use cookies only to store session information and track
						your usage of the website. We do not use any third-party cookies.
					</li>
					<li>
						Third-Party Sources: We do not collect information from third-party
						sources.
					</li>
				</ul>
			</li>
			<li>
				<h3>Use of Collected Information</h3>
				<ul>
					<li>
						Service Delivery: We use personal data to provide and improve our
						services, including:
						<ul>
							<li>
								Facilitating the buying and selling of textile design files
							</li>
							<li>Processing transactions and payments</li>
							<li>Authenticating users and managing accounts</li>
							<li>Personalizing user experience</li>
							<li>Improving our platform and services</li>
						</ul>
					</li>
					<li>
						Communication: We use your contact information to:
						<ul>
							<li>
								Send important notifications about your account or purchases
							</li>
							<li>Respond to your inquiries and support requests</li>
							<li>Send promotional materials (with an option to opt-out)</li>
						</ul>
					</li>
					<li>
						Analytics: We analyze usage data to improve our services and user
						experience.
					</li>
					<li>
						Legal Compliance: We may use data to comply with legal obligations
						or respond to lawful requests from authorities.
					</li>
				</ul>
			</li>
			<li>
				<h3>Disclosure of Information</h3>
				<ul>
					<li>
						Third-Party Service Providers: We share personal data with trusted
						service providers who help us operate our business, including:
						<ul>
							<li>Payment processors (to facilitate transactions)</li>
							<li>
								Cloud storage providers (to store design files and user data
								securely)
							</li>
							<li>
								Email service providers (to send notifications and
								communications)
							</li>
						</ul>
						These providers are obligated to protect your data and use it only
						for the specific services they provide to us.
					</li>
					<li>
						Legal Requirements: We may disclose personal data if required by
						law, in response to legal processes, or to protect our rights and
						the rights of our users.
					</li>
					<li>
						Business Transfers: In the event of a merger, acquisition, or sale
						of all or part of our business, personal data may be transferred as
						part of that transaction.
					</li>
					<li>
						With User Consent: We may share information with third parties when
						you have given us consent to do so.
					</li>
				</ul>
			</li>
			<li>
				<h3>Data Security</h3>
				<ul>
					<li>
						Security Measures: We employ industry-standard security measures to
						protect your personal data:
						<ul>
							<li>
								All data is stored on secure servers with restricted access.
							</li>
							<li>
								We use encrypted databases to store sensitive information.
							</li>
							<li>
								All data transmissions between your browser and our servers are
								encrypted using HTTPS.
							</li>
							<li>
								We do not store any credit card information on our servers. All
								payment processing is handled by trusted third-party payment
								processors.
							</li>
						</ul>
					</li>
					<li>
						No Absolute Security: While we implement these stringent measures to
						safeguard your personal data, it's important to note that no method
						of transmission over the Internet or electronic storage is 100%
						secure. We strive to protect your personal information but cannot
						guarantee its absolute security.
					</li>
				</ul>
			</li>
			<li>
				<h3>Data Retention</h3>
				<ul>
					<li>
						Retention Period: We retain personal data for as long as necessary
						to fulfill the purposes for which it was collected, typically for
						the duration of your account with us plus an additional period for
						legal and operational purposes. The criteria used to determine the
						retention period include:
						<ul>
							<li>The length of time you have an account with us</li>
							<li>Legal obligations under applicable law</li>
							<li>Statute of limitations under applicable law</li>
							<li>Ongoing or potential legal disputes</li>
							<li>Guidelines issued by relevant data protection authorities</li>
						</ul>
					</li>
					<li>
						Deletion of Data: When personal data is no longer needed, we
						securely delete or anonymize it. You can request deletion of your
						personal data at any time by contacting us through our support page.
						We will process your request within 30 days, unless we need to
						retain the data for legal or operational purposes. In such cases, we
						will inform you of the reason for the extended retention.
					</li>
				</ul>
			</li>
			<li>
				<h3>User Rights</h3>
				<ul>
					<li>
						Access and Correction: Users have the right to access and correct
						their personal data. To request access or make corrections, please
						contact us through our support page.
					</li>
					<li>
						Withdrawal of Consent: Users can withdraw consent for data
						processing at any time by contacting us through our support page.
						Note that this may affect our ability to provide certain services.
					</li>
					<li>
						Data Portability: Users have the right to receive their personal
						data in a structured, commonly used, and machine-readable format.
					</li>
					<li>
						Right to be Forgotten: Users can request the deletion of their
						personal data under certain circumstances.
					</li>
					<li>
						Grievance Redressal: For any concerns or complaints regarding
						personal data, please refer to our{" "}
						<Button variant="link" className="p-0 h-auto w-auto !text-primary">
							<Link href="/support">support page</Link>
						</Button>{" "}
						for contact information.
					</li>
				</ul>
			</li>
			<li>
				<h3>Cookies and Tracking Technologies</h3>
				<ul>
					<li>
						We only use cookies to store session information and to track your
						usage of the website.
					</li>
					<li>We do not use any third-party cookies.</li>
				</ul>
			</li>
			<li>
				<h3>International Data Transfers</h3>
				<ul>
					<li>All our data is stored in Singapore in secure servers.</li>
					<li>
						We are compliant with applicable data protection laws for
						international transfers.
					</li>
				</ul>
			</li>
			<li>
				<h3>Children's Privacy</h3>
				<ul>
					<li>
						Age Restrictions: There is no age restriction to use the service.
						However, users under the age of 18 must have parental consent.
					</li>
					<li>
						Parental Consent: For users under the age of 18, parental consent is
						required as this is a marketplace with monetary transactions.
					</li>
				</ul>
			</li>
			<li>
				<h3>Changes to the Privacy Policy</h3>
				<ul>
					<li>
						Notification of Changes: We will notify users via email of any
						significant changes to the privacy policy.
					</li>
					<li>
						Effective Date: This privacy policy is effective as of last updated
						date. Any future updates will be clearly dated.
					</li>
				</ul>
			</li>
			<li>
				<h3>Legal Compliance</h3>
				<ul>
					<li>
						Privacy policy is governed by Indian law, restricted to Surat
						jurisdiction.
					</li>
					<li>
						Dispute Resolution: Outline the process for resolving disputes
						related to privacy matters.
					</li>
				</ul>
			</li>
			<li>
				<h3>Contact Information</h3>
				<ul>
					<li>
						Please refer to the{" "}
						<Button variant="link" className="p-0 h-auto w-auto !text-primary">
							<Link href="/support">support page</Link>
						</Button>{" "}
						for contact information.
					</li>
				</ul>
			</li>
		</ol>
	);
};

export default function PrivacyPolicyPage() {
	return (
		<>
			<Header />
			<main className="relative p-4 md:gap-6 md:p-8 mx-auto max-w-3xl">
				<h1 className="text-2xl font-semibold">Privacy Policy</h1>
				<h2 className="text-sm font-medium text-primary mt-2">
					Last updated at 18<sup>th</sup> October 2024
				</h2>
				<div className="prose mt-8 w-full">
					<PolicyList />
					<p className="text-sm my-8 text-muted-foreground">
						Please note: This Privacy Policy is provided for informational
						purposes only and does not constitute legal advice. It is
						recommended that you consult with a legal professional to ensure
						that your privacy policy complies with all applicable laws and
						regulations.
					</p>
				</div>
			</main>
		</>
	);
}
