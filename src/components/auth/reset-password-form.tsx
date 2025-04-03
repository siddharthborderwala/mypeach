"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "@/lib/actions/users";
import { FormError } from "@/components/form-error";
import { Spinner } from "@/components/spinner";

export default function ResetPassword() {
	const [token] = useQueryState("token");
	const [state, formAction] = useFormState(resetPasswordAction, {
		error: "",
	});

	return (
		<div className="flex items-center justify-center py-12 px-4 w-full h-full">
			<form className="grid gap-6 max-w-[400px] w-full" action={formAction}>
				<div className="grid gap-2">
					<h1 className="text-3xl font-bold">Reset Password</h1>
					<p className="text-balance text-muted-foreground">
						Enter your new password
					</p>
				</div>
				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="password">New Password</Label>
						<Input name="password" type="password" required />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="confirmPassword">Confirm New Password</Label>
						<Input name="confirmPassword" type="password" required />
					</div>
					{token ? <input type="hidden" name="token" value={token} /> : null}
					<SubmitButton />
				</div>
				<FormError state={state} />
			</form>
		</div>
	);
}

export const SubmitButton = () => {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" className="w-full" disabled={pending}>
			{pending ? <Spinner size={16} className="mr-2" /> : null}
			<span>Reset Password</span>
		</Button>
	);
};
