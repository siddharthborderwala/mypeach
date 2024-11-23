"use client";

import { checkoutAction } from "@/lib/actions/checkout";
import { ProceedToPaymentButton } from "./button";
import { checkout } from "@/lib/checkout";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ProceedToPaymentForm({
	amount,
	cartId,
	className,
}: {
	amount: number;
	cartId: number;
	className?: string;
}) {
	const router = useRouter();

	return (
		<form
			className={className}
			action={async () => {
				try {
					await checkoutAction();

					const response = await checkout({
						amount,
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
