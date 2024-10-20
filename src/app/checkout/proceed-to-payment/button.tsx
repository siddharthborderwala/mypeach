"use client";

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

export function ProceedToPaymentButton() {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" className="w-full gap-2" disabled={pending}>
			{pending ? <Spinner /> : null}
			<span>Proceed to Payment</span>
		</Button>
	);
}
