"use server";

import { checkoutAction } from "@/lib/actions/checkout";
import { ProceedToPaymentButton } from "./button";
import { checkout } from "@/lib/checkout";
import { redirect } from "next/navigation";

export async function ProceedToPaymentForm({
	amount,
	cartId,
}: {
	amount: number;
	cartId: number;
}) {
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
						redirect(`/order?orderId=${response.data.orderId}`);
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
