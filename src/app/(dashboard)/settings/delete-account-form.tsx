"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { FormError } from "@/components/form-error";
import { Spinner } from "@/components/spinner";
import { useFormState, useFormStatus } from "react-dom";
import { deleteAccountAction } from "@/lib/actions/users";

export function DeleteAccountForm() {
	const [open, setOpen] = useState(false);
	const [state, formAction] = useFormState(deleteAccountAction, {
		error: "",
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="destructive">Delete Account</Button>
			</DialogTrigger>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>You are about to delete your account.</DialogTitle>
					<DialogDescription>This action cannot be reversed.</DialogDescription>
				</DialogHeader>
				<form action={formAction} className="space-x-2 flex items-center">
					<FormError state={state} />
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
					>
						Cancel
					</Button>
					<SubmitButton />
				</form>
			</DialogContent>
		</Dialog>
	);
}

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" variant="destructive" disabled={pending}>
			{pending ? <Spinner className="mr-2" /> : null}
			{pending ? "Deleting..." : "Delete Account"}
		</Button>
	);
}
