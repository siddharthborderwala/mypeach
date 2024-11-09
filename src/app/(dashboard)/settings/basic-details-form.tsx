"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { Spinner } from "@/components/spinner";
import {
	requestEmailVerificationEmail,
	updateBasicUserDetails,
} from "@/lib/actions/users";
import { useFormState, useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Envelope, SealCheck } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";

function EmailVerificationSection({
	emailVerified,
	emailVerificationTokens,
}: {
	emailVerified: boolean;
	emailVerificationTokens: { expiresAt: Date; createdAt: Date }[];
}) {
	const { mutate, isPending } = useMutation({
		mutationKey: ["request-email-verification"],
		mutationFn: requestEmailVerificationEmail,
		onSuccess: () => {
			toast.success("Verification email sent");
		},
		onError: (e) => {
			toast.error(e.message);
		},
	});

	return emailVerified ? (
		<Button
			disabled={true}
			variant="secondary"
			className="h-auto py-[7px] text-sm border gap-2 text-success select-none"
		>
			<SealCheck weight="fill" className="w-4 h-4" />
			<span>Verified</span>
		</Button>
	) : (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					disabled={emailVerificationTokens.length > 3 || isPending}
					variant="secondary"
					className="h-auto py-[7px] text-sm border gap-2 text-success select-none"
					type="button"
					onClick={() => mutate()}
				>
					{isPending ? <Spinner size={16} /> : <Envelope className="w-4 h-4" />}
					<span>Get verified</span>
				</Button>
			</TooltipTrigger>
			{emailVerificationTokens.length > 3 ? (
				<TooltipContent>
					You can request a maximum of 3 verification emails per day.
				</TooltipContent>
			) : null}
		</Tooltip>
	);
}

export function BasicDetailsForm({
	initialData,
}: {
	initialData: {
		username: string;
		name: string | null;
		email: string;
		emailVerified: boolean;
		emailVerificationTokens: {
			expiresAt: Date;
			createdAt: Date;
		}[];
	};
}) {
	const formRef = useRef<HTMLFormElement>(null);
	const [state, formAction] = useFormState(updateBasicUserDetails, {
		error: "",
	});

	useEffect(() => {
		if (state.success) {
			window.location.reload();
		}
	}, [state.success]);

	return (
		<form
			ref={formRef}
			action={formAction}
			className="w-full space-y-4 [&_input]:max-w-sm"
		>
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
				<div className="flex items-center gap-2 mt-2">
					<Input
						name="email"
						id="email"
						defaultValue={initialData.email}
						required
						className="peer data-[error=true]:border-red-500"
					/>
					<EmailVerificationSection
						emailVerified={initialData.emailVerified}
						emailVerificationTokens={initialData.emailVerificationTokens}
					/>
				</div>
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
