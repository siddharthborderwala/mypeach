"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { Spinner } from "@/components/spinner";
import { updateBasicUserDetails } from "@/lib/actions/users";
import { useFormState, useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function BasicDetailsForm({
	initialData,
}: {
	initialData: {
		username: string;
		name: string | null;
		email: string;
	};
}) {
	const formRef = useRef<HTMLFormElement>(null);
	const [state, formAction] = useFormState(updateBasicUserDetails, {
		error: "",
	});

	useEffect(() => {
		if (state.success) {
			toast.success("Details updated successfully");
			formRef.current?.reset();
		}
	}, [state.success]);

	return (
		<form ref={formRef} action={formAction} className="space-y-4 max-w-sm">
			<div>
				<Label htmlFor="name" className="peer-data-[error=true]:text-red-500">
					Name <span className="text-muted-foreground">(optional)</span>
				</Label>
				<Input
					name="name"
					id="name"
					data-error={state.fieldErrors?.name}
					defaultValue={initialData.name ?? ""}
					className="peer data-[error=true]:border-red-500 mt-2"
				/>
				{state.fieldErrors?.name && (
					<p className="text-red-500 text-sm mt-2">{state.fieldErrors.name}</p>
				)}
			</div>
			<div>
				<Label
					htmlFor="username"
					className="peer-data-[error=true]:text-red-500"
				>
					Username
				</Label>
				<Input
					name="username"
					id="username"
					defaultValue={initialData.username}
					required
					className="peer data-[error=true]:border-red-500 mt-2"
				/>
				{state.fieldErrors?.username && (
					<p className="text-red-500 text-sm mt-2">
						{state.fieldErrors.username}
					</p>
				)}
			</div>
			<div>
				<Label htmlFor="email" className="peer-data-[error=true]:text-red-500">
					Email
				</Label>
				<Input
					name="email"
					id="email"
					defaultValue={initialData.email}
					required
					className="peer data-[error=true]:border-red-500 mt-2"
				/>
				{state.fieldErrors?.email && (
					<p className="text-red-500 text-sm mt-2">{state.fieldErrors.email}</p>
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
			Update Details
		</Button>
	);
}
