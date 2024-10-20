import { checkoutAction } from "@/lib/actions/checkout";
import { ProceedToPaymentButton } from "./button";

export function ProceedToPaymentForm() {
	return (
		<form action={checkoutAction}>
			<ProceedToPaymentButton />
		</form>
	);
}
