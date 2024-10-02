"use client";

import Link from "next/link";
import { useFormStatus, useFormState } from "react-dom";
import { parseAsString, useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/lib/actions/users";
import { FormError } from "@/components/form-error";
import { Spinner } from "@/components/spinner";

export default function Login() {
	const [email] = useQueryState("email", parseAsString);
	const [redirectTo] = useQueryState("redirectTo");
	const [state, formAction] = useFormState(signInAction, {
		error: "",
	});

	return (
		<div className="flex items-center justify-center py-12 px-4 w-full h-full">
			<form className="grid gap-6 max-w-[400px] w-full" action={formAction}>
				<div className="grid gap-2">
					<h1 className="text-3xl font-bold">Login</h1>
					<p className="text-balance text-muted-foreground">
						Welcome back to Peach
					</p>
				</div>
				<div className="grid gap-4">
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							defaultValue={email ?? ""}
							required
						/>
					</div>
					<div className="grid gap-2">
						<div className="flex items-center">
							<Label htmlFor="password">Password</Label>
							<Link
								href="/forgot-password"
								className="ml-auto inline-block text-sm underline"
							>
								Forgot your password?
							</Link>
						</div>
						<Input id="password" name="password" type="password" required />
					</div>
					{redirectTo ? (
						<input type="hidden" name="redirectTo" value={redirectTo} />
					) : null}
					<SubmitButton />
				</div>
				<FormError state={state} />
				<div className="mt-4 text-center text-sm">
					Don&apos;t have an account?
					<Link href="/register" className="underline ml-1">
						Register
					</Link>
				</div>
			</form>
		</div>
	);
}

export const SubmitButton = () => {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" className="w-full" disabled={pending}>
			{pending ? <Spinner size={16} className="mr-2" /> : null}
			<span>Submit</span>
		</Button>
	);
};
