"use client";

import { checkoutAction } from "@/lib/actions/checkout";
import { ProceedToPaymentButton } from "./button";
import { checkout } from "@/lib/checkout";
import { useRouter } from "next/navigation";

export function ProceedToPaymentForm({
	amount,
	cartId,
}: {
	amount: number;
	cartId: number;
}) {
	const router = useRouter();

	return (
		<form
			action={async () => {
				try {
					await checkoutAction();
					const response = await checkout({
						amount,
						cartId,
					});

					if (response.success) {
						console.log(response);
						router.push(`/order?orderId=${response.data.orderId}`);
					}
				} catch (error) {
					console.error("Error placing order", error);
				}
			}}
		>
			<ProceedToPaymentButton />
		</form>
	);
}
