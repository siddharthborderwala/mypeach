"use client";
import { Button } from "@/components/ui/button";
import { VendorForm } from "@/components/vendor-form";
import { VendorOnboardingModal } from "@/components/vendor-onboarding-modal";
import { useGetVendor } from "@/hooks/vendor";
import { Spinner, Money } from "@phosphor-icons/react/dist/ssr";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";

export function PayoutsForm() {
	const { data: vendor, isLoading } = useGetVendor();

	if (isLoading) {
		return (
			<div className="w-full flex justify-center items-center h-64">
				<Spinner className="w-6 h-6 text-muted-foreground animate-spin" />
			</div>
		);
	}

	if (!vendor) {
		return (
			<Dialog defaultOpen>
				<div className="mt-20 flex flex-col items-center justify-center">
					<Money className="w-12 h-12 text-muted-foreground" />
					<h3 className="text-xl font-semibold mt-4">Start getting paid</h3>
					<p className="text-muted-foreground mt-2">
						Create your vendor profile to start selling your designs!
					</p>
					<DialogTrigger asChild>
						<Button className="mt-8">Create Vendor Profile</Button>
					</DialogTrigger>
				</div>
				<VendorOnboardingModal />
			</Dialog>
		);
	}

	return (
		<div className="w-full space-y-4 [&_input]:max-w-sm">
			<VendorForm
				data={{
					vendorId: vendor.id,
					name: vendor.name,
					phone: vendor.phone,
					accountNumber: vendor.BankAccount?.accountNumber,
					ifsc: vendor.BankAccount?.IFSC,
					accountHolder: vendor.BankAccount?.accountHolder,
					pan: vendor.KYC?.pan,
					status: vendor.status,
				}}
			/>
		</div>
	);
}
