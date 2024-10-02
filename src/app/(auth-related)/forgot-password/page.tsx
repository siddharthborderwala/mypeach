"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "@/lib/actions/users";
import { FormError } from "@/components/form-error";
import { Spinner } from "@/components/spinner";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function ForgotPassword() {
	const formRef = useRef<HTMLFormElement>(null);
	const [state, formAction] = useFormState(forgotPasswordAction, {
		error: "",
	});

	useEffect(() => {
		if (state.success) {
			toast.success("You will receive an email to reset your password.");
			formRef.current?.reset();
		}
	}, [state.success]);

	return (
		<div className="flex items-center justify-center py-12 px-4 w-full h-full">
			<form
				ref={formRef}
				className="grid gap-6 max-w-[400px] w-full"
				action={formAction}
			>
				<div className="grid gap-2">
					<h1 className="text-3xl font-bold">Forgot Password?</h1>
					<p className="text-balance text-muted-foreground">
						We&apos;ll send you a link to reset your password.
					</p>
				</div>
				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input name="email" type="email" required />
					</div>
					<SubmitButton />
				</div>
				<FormError state={state} />
				<div className="mt-4 text-center text-sm">
					Remember your password?
					<Link href="/login" className="underline ml-1">
						Login
					</Link>
				</div>
			</form>
		</div>
	);
}

const SubmitButton = () => {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" className="w-full" disabled={pending}>
			{pending ? <Spinner size={16} className="mr-2" /> : null}
			<span>Reset Password</span>
		</Button>
	);
};
