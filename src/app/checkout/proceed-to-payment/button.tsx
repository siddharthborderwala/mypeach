"use client";

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";

export function ProceedToPaymentButton({
	className,
}: {
	className?: string;
}) {
	const { pending } = useFormStatus();

	return (
		<>
			<Button
				type="submit"
				className={`max-sm:h-full w-full gap-2 ${className}`}
				disabled={pending}
			>
				{pending ? <Spinner /> : null}

				<span>Place Order</span>
			</Button>
		</>
	);
}
