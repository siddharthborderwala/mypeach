"use client";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { VendorForm } from "../vendor-form";

export function VendorOnboardingModal() {
	return (
		<DialogContent className="max-w-sm">
			<DialogHeader>
				<DialogTitle>Create Vendor Profile</DialogTitle>
			</DialogHeader>
			<VendorForm />
		</DialogContent>
	);
}
