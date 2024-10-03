import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/reset-password-form";

type ResetPasswordProps = {
	searchParams: {
		token?: string;
	};
};

export const metadata: Metadata = {
	title: "Reset Password | Peach",
};

export default function ResetPassword({ searchParams }: ResetPasswordProps) {
	if (!searchParams.token) {
		redirect("/forgot-password");
	}

	return (
		<div className="flex items-center justify-center py-12 px-4 w-full h-full">
			<ResetPasswordForm />
		</div>
	);
}
