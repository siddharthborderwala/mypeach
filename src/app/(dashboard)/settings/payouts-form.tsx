"use client";

import { Button } from "@/components/ui/button";
import { getVendor } from "@/lib/actions/payouts";
import { cn } from "@/lib/utils";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
	createKYCAction,
	createUPIAction,
	createVendorAction,
	updateKYCAction,
	updateVendorAction,
	updateUPIAction,
} from "@/lib/actions/vendor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/spinner";
import { queryClient } from "@/app/global-query-client";
import { FormError } from "@/components/form-error";
import { toast } from "sonner";
import { useState } from "react";

enum StepKey {
	Vendor = 0,
	KYC = 1,
	UPI = 2,
}

interface Step {
	title: string;
	description: string;
	buttonText: string;
	isComplete: boolean;
	key: StepKey;
}

function VendorForm({
	vendor,
	onCreate,
}: {
	vendor?: {
		id: number;
		name: string;
		phone: string;
	} | null;
	onCreate?: () => void;
}) {
	const {
		mutate: createVendor,
		isPending,
		error,
	} = useMutation({
		mutationFn: vendor
			? (args: { name: string; phone: string }) =>
					updateVendorAction({ ...args, id: vendor.id })
			: createVendorAction,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["vendor"] });
			toast.success(
				vendor
					? "Vendor profile updated successfully!"
					: "Vendor profile created successfully!",
			);
			if (!vendor && onCreate) onCreate();
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const name = formData.get("name") as string;
		const phone = formData.get("phone") as string;
		createVendor({ name, phone });
	};

	return (
		<div className="flex flex-col items-start">
			<h3 className="text-xl font-semibold mt-4">
				{vendor ? "Vendor Profile" : "Start getting paid"}
			</h3>
			<p className="text-muted-foreground mt-1">
				{vendor
					? "Update your vendor profile details"
					: "Create your vendor profile to start selling your designs!"}
			</p>
			<form onSubmit={handleSubmit} className="mt-4 w-full max-w-sm">
				<div className="w-full">
					<Label className="font-medium">Name</Label>
					<p className="text-xs text-muted-foreground">Your legal name</p>
					<Input name="name" className="mt-2" defaultValue={vendor?.name} />
				</div>
				<div className="w-full mt-4">
					<Label className="font-medium">Phone Number</Label>
					<p className="text-xs text-muted-foreground">
						A phone number where we can contact you
					</p>
					<Input name="phone" className="mt-2" defaultValue={vendor?.phone} />
				</div>
				<Button disabled={isPending} type="submit" className="mt-6 gap-2">
					{isPending ? <Spinner /> : null}
					<span>{vendor ? "Save Changes" : "Save Details"}</span>
				</Button>
				{error ? (
					<FormError state={{ error: error.message }} className="mt-6" />
				) : null}
			</form>
		</div>
	);
}

function KYCForm({
	kyc,
	onCreate,
}: {
	kyc?: {
		id: number;
		pan: string;
	} | null;
	onCreate?: () => void;
}) {
	const {
		mutate: submitKYC,
		isPending,
		error,
	} = useMutation({
		mutationFn: kyc
			? (args: { panNumber: string }) =>
					updateKYCAction({ ...args, id: kyc.id })
			: createKYCAction,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["vendor"] });
			toast.success(
				kyc
					? "KYC details updated successfully!"
					: "KYC details saved successfully!",
			);
			if (!kyc && onCreate) onCreate();
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const panNumber = formData.get("panNumber") as string;
		submitKYC({ panNumber });
	};

	return (
		<div className="flex flex-col items-start">
			<h3 className="text-xl font-semibold mt-4">
				{kyc ? "KYC Details" : "Complete KYC"}
			</h3>
			<p className="text-muted-foreground mt-1">
				{kyc
					? "Update your KYC details"
					: "Verify your identity to start receiving payments"}
			</p>
			<form onSubmit={handleSubmit} className="mt-4 w-full max-w-sm">
				<div className="w-full">
					<Label className="font-medium">PAN Card Number</Label>
					<p className="text-xs text-muted-foreground">
						Enter your valid PAN card number
					</p>
					<Input
						name="panNumber"
						className="mt-2"
						placeholder="ABCDE1234F"
						maxLength={10}
						defaultValue={kyc?.pan}
					/>
				</div>
				<Button disabled={isPending} type="submit" className="mt-6 gap-2">
					{isPending ? <Spinner /> : null}
					<span>{kyc ? "Save Changes" : "Save Details"}</span>
				</Button>
				{error ? (
					<FormError state={{ error: error.message }} className="mt-6" />
				) : null}
			</form>
		</div>
	);
}

function UPIForm({
	upi,
	onCreate,
}: {
	upi?: {
		id: number;
		vpa: string;
		accountHolder: string;
	} | null;
	onCreate?: () => void;
}) {
	const {
		mutate: submitUPI,
		isPending,
		error,
	} = useMutation({
		mutationFn: upi
			? (args: { upiId: string; accountHolderName: string }) =>
					updateUPIAction({ ...args, id: upi.id })
			: createUPIAction,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["vendor"] });
			toast.success(
				upi
					? "UPI details updated successfully!"
					: "UPI details saved successfully!",
			);
			if (!upi && onCreate) onCreate();
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const upiId = formData.get("upiId") as string;
		const accountHolderName = formData.get("accountHolderName") as string;
		submitUPI({ upiId, accountHolderName });
	};

	return (
		<div className="flex flex-col items-start">
			<h3 className="text-xl font-semibold mt-4">
				{upi ? "UPI Details" : "Add UPI Details"}
			</h3>
			<p className="text-muted-foreground mt-1">
				{upi
					? "Update your UPI details"
					: "Add your UPI ID to receive payments directly to your bank account"}
			</p>
			<form onSubmit={handleSubmit} className="mt-4 w-full max-w-sm">
				<div className="w-full">
					<Label className="font-medium">UPI ID</Label>
					<p className="text-xs text-muted-foreground">
						Where you want to receive payments
					</p>
					<Input
						name="upiId"
						className="mt-2"
						placeholder="username@upi"
						defaultValue={upi?.vpa}
					/>
				</div>
				<div className="w-full mt-4">
					<Label className="font-medium">Account Holder Name</Label>
					<p className="text-xs text-muted-foreground">
						As it appears on the bank account
					</p>
					<Input
						name="accountHolderName"
						className="mt-2"
						defaultValue={upi?.accountHolder}
					/>
				</div>
				<Button disabled={isPending} type="submit" className="mt-6 gap-2">
					{isPending ? <Spinner /> : null}
					<span>{upi ? "Save Changes" : "Save Details"}</span>
				</Button>
				{error ? (
					<FormError state={{ error: error.message }} className="mt-6" />
				) : null}
			</form>
		</div>
	);
}

export function PayoutsForm({
	vendor: _vendor,
}: { vendor: Awaited<ReturnType<typeof getVendor>> }) {
	const { data: vendor } = useQuery({
		queryKey: ["vendor"],
		queryFn: () => getVendor(),
		initialData: _vendor,
		placeholderData: keepPreviousData,
	});

	const steps: Step[] = [
		{
			title: "Vendor Profile",
			description: "Create your vendor profile to start selling your designs!",
			buttonText: "Create Vendor Profile",
			isComplete: !!vendor,
			key: StepKey.Vendor,
		},
		{
			title: "KYC Details",
			description:
				"Complete your KYC verification to start receiving payments!",
			buttonText: "Complete KYC",
			isComplete: !!vendor?.KYC,
			key: StepKey.KYC,
		},
		{
			title: "UPI Details",
			description: "Add your UPI details to start receiving payments!",
			buttonText: "Add UPI",
			isComplete: !!vendor?.UPI,
			key: StepKey.UPI,
		},
	];

	const firstIncompleteStep = steps.findIndex((step) => !step.isComplete) as
		| -1
		| 0
		| 1
		| 2;

	const [selectedStep, setSelectedStep] = useState<Step["key"]>(() => {
		if (firstIncompleteStep === -1) return StepKey.Vendor;
		switch (firstIncompleteStep) {
			case 0:
				return StepKey.Vendor;
			case 1:
				return StepKey.KYC;
			case 2:
				return StepKey.UPI;
		}
	});

	return (
		<div className="w-full">
			<div className="w-full flex items-stretch justify-between gap-6">
				{steps.map((step, index) => (
					<button
						key={step.title}
						onClick={() => setSelectedStep(step.key)}
						className="w-full text-left"
						type="button"
					>
						<h3
							className={cn(
								"text-sm font-medium",
								index === selectedStep ? "text-primary" : null,
								step.isComplete ? "cursor-pointer hover:text-primary" : null,
							)}
						>
							{`${index + 1}. ${step.title}`}
						</h3>
						<div
							className={cn(
								"h-1 w-full bg-muted rounded-full mt-2",
								index < firstIncompleteStep ? "bg-primary" : null,
							)}
						/>
					</button>
				))}
			</div>
			<div className="mt-4">
				{selectedStep === StepKey.Vendor ? (
					<VendorForm
						vendor={vendor}
						onCreate={() => setSelectedStep(StepKey.KYC)}
					/>
				) : null}
				{selectedStep === StepKey.KYC ? (
					<KYCForm
						kyc={vendor?.KYC}
						onCreate={() => setSelectedStep(StepKey.UPI)}
					/>
				) : null}
				{selectedStep === StepKey.UPI ? (
					<UPIForm
						upi={vendor?.UPI}
						onCreate={() => setSelectedStep(StepKey.Vendor)}
					/>
				) : null}
			</div>
		</div>
	);
}
