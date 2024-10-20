"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { parseAsString, useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction } from "@/lib/actions/users";
import { FormError } from "@/components/form-error";
import { Spinner } from "@/components/spinner";

export function RegisterForm() {
	const [email] = useQueryState("email", parseAsString);
	const [redirectTo] = useQueryState("redirectTo");
	const [state, formAction] = useFormState(signUpAction, {
		error: "",
	});

	return (
		<form className="grid gap-6 max-w-[400px] w-full" action={formAction}>
			<div className="grid gap-2">
				<h1 className="text-3xl font-bold">Register</h1>
				<p className="text-balance text-muted-foreground">
					Get started with Peach
				</p>
			</div>
			<div className="grid gap-4">
				<div className="grid gap-2">
					<Label htmlFor="email">Email</Label>
					<Input
						name="email"
						type="email"
						defaultValue={email ?? ""}
						required
					/>
				</div>
				<div className="grid gap-2">
					<div className="flex items-center">
						<Label htmlFor="password">Password</Label>
					</div>
					<Input name="password" type="password" required />
				</div>
				{redirectTo ? (
					<input type="hidden" name="redirectTo" value={redirectTo} />
				) : null}
				<SubmitButton />
			</div>
			<FormError state={state} />
			<div className="mt-4 text-center text-sm">
				Already have an account?
				<Link
					href={
						redirectTo
							? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
							: "/login"
					}
					className="underline ml-1"
				>
					Login
				</Link>
			</div>
		</form>
	);
}

const SubmitButton = () => {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" className="w-full" disabled={pending}>
			{pending ? <Spinner size={16} className="mr-2" /> : null}
			<span>Create Account</span>
		</Button>
	);
};
