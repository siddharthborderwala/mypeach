import type { Metadata } from "next";
import { ForgotPasswordForm } from "./form";

export const metadata: Metadata = {
	title: "Forgot Password | Peach",
	description:
		"Forgot your password? No problem. We'll send you an email to reset it.",
};

export default function ForgotPassword() {
	return (
		<div className="flex items-center justify-center py-12 px-4 w-full h-full">
			<ForgotPasswordForm />
		</div>
	);
}
