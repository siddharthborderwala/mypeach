"use client";

import { checkoutAction } from "@/lib/actions/checkout";
import { ProceedToPaymentButton } from "./button";
import { checkout } from "@/lib/checkout";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ProceedToPaymentForm({
	cartId,
	className,
}: {
	cartId: number;
	className?: string;
}) {
	const router = useRouter();

	return (
		<form
			className={className}
			action={async () => {
				try {
					const allOK = await checkoutAction();

					if (!allOK) {
						return;
					}

					const response = await checkout({
						cartId,
					});

					if (response.success) {
						router.push(`/order?orderId=${response.data.orderId}`);
					}
				} catch (error) {
					toast.error("Sorry, we couldn't process your order", {
						dismissible: true,
					});
				}
			}}
		>
			<ProceedToPaymentButton />
		</form>
	);
}
