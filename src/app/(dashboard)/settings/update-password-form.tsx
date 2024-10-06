"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { Spinner } from "@/components/spinner";
import { updatePasswordAction } from "@/lib/actions/users";
import { useFormState, useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function UpdatePasswordForm() {
	const formRef = useRef<HTMLFormElement>(null);
	const [state, formAction] = useFormState(updatePasswordAction, {
		error: "",
	});

	useEffect(() => {
		if (state.success) {
			toast.success("Password updated successfully");
			formRef.current?.reset();
		}
	}, [state.success]);

	return (
		<form ref={formRef} action={formAction} className="space-y-4 max-w-sm">
			<div>
				<Label htmlFor="name" className="peer-data-[error=true]:text-red-500">
					Current Password
				</Label>
				<Input
					name="currentPassword"
					id="currentPassword"
					type="password"
					data-error={state.fieldErrors?.currentPassword}
					className="peer data-[error=true]:border-red-500 mt-2"
				/>
				{state.fieldErrors?.currentPassword && (
					<p className="text-red-500 text-sm mt-2">
						{state.fieldErrors.currentPassword}
					</p>
				)}
			</div>
			<div>
				<Label
					htmlFor="newPassword"
					className="peer-data-[error=true]:text-red-500"
				>
					New Password
				</Label>
				<Input
					name="newPassword"
					id="newPassword"
					type="password"
					required
					className="peer data-[error=true]:border-red-500 mt-2"
				/>
				{state.fieldErrors?.newPassword && (
					<p className="text-red-500 text-sm mt-2">
						{state.fieldErrors.newPassword}
					</p>
				)}
			</div>
			<div>
				<Label
					htmlFor="confirmNewPassword"
					className="peer-data-[error=true]:text-red-500"
				>
					Confirm New Password
				</Label>
				<Input
					name="confirmNewPassword"
					id="confirmNewPassword"
					type="password"
					required
					className="peer data-[error=true]:border-red-500 mt-2"
				/>
				{state.fieldErrors?.confirmNewPassword && (
					<p className="text-red-500 text-sm mt-2">
						{state.fieldErrors.confirmNewPassword}
					</p>
				)}
			</div>
			<FormError state={state} />
			<SubmitButton />
		</form>
	);
}

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" disabled={pending} className="mt-4">
			{pending ? <Spinner className="mr-2" /> : null}
			Change Password
		</Button>
	);
}
