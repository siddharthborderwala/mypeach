import { Button } from "@/components/ui/button";
import { getVendor } from "@/lib/actions/payouts";
import { Money } from "@phosphor-icons/react/dist/ssr";

export async function PayoutsForm() {
	const vendor = await getVendor();

	if (!vendor) {
		return (
			<div className="mt-20 flex flex-col items-center justify-center">
				<Money className="w-12 h-12 text-muted-foreground" />
				<h3 className="text-xl font-semibold mt-4">Start getting paid</h3>
				<p className="text-muted-foreground mt-2">
					Create your vendor profile to start selling your designs!
				</p>
				<Button className="mt-8">Create Vendor Profile</Button>
			</div>
		);
	}

	if (!vendor.KYC) {
		return (
			<div className="mt-20 flex flex-col items-center justify-center">
				<Money className="w-12 h-12 text-muted-foreground" />
				<h3 className="text-xl font-semibold mt-4">Complete KYC</h3>
				<p className="text-muted-foreground mt-2">
					Complete your KYC verification to start receiving payments!
				</p>
				<Button className="mt-8">Complete KYC</Button>
			</div>
		);
	}

	if (!vendor.UPI) {
		return (
			<div className="mt-20 flex flex-col items-center justify-center">
				<Money className="w-12 h-12 text-muted-foreground" />
				<h3 className="text-xl font-semibold mt-4">Add UPI</h3>
				<p className="text-muted-foreground mt-2">
					Add your UPI details to start receiving payments!
				</p>
				<Button className="mt-8">Add UPI</Button>
			</div>
		);
	}
}
