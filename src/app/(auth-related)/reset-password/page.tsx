import { redirect } from "next/navigation";
import ResetPasswordForm from "@/components/auth/reset-password-form";

type ResetPasswordProps = {
	searchParams: {
		token?: string;
	};
};

export default async function ResetPassword({
	searchParams,
}: ResetPasswordProps) {
	if (!searchParams.token) {
		redirect("/forgot-password");
	}

	return (
		<div className="flex items-center justify-center py-12 px-4 w-full h-full">
			<ResetPasswordForm />
		</div>
	);
}
