import { useQuery } from "@tanstack/react-query";

export interface Vendor {
	id: number;
	name: string;
	phone: string;
	UPI: {
		vpa: string;
		accountHolder: string;
	};
	KYC: {
		pan: string;
	};
	BankAccount: {
		accountNumber: string;
		IFSC: string;
		accountHolder: string;
	};
	status: Status;
}

type Status =
	| "ACTIVE"
	| "BLOCKED"
	| "DELETED"
	| "IN_BENE_CREATION"
	| "ACTION_REQUIRED"
	| "BANK_VALIDATION_FAILED";

export function useGetVendor(options?: { refetchOnWindowFocus?: boolean }): {
	data: Vendor;
	isLoading: boolean;
} {
	const { data, isLoading } = useQuery({
		queryKey: ["get-vendor"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/vendor");

				if (!res.ok) {
					throw new Error("Failed to fetch vendor");
				}

				return res.json();
			} catch (error) {
				return undefined;
			}
		},
		initialData: undefined,
		...options,
	});

	return {
		data,
		isLoading,
	};
}
