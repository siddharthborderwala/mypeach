import { Alert, AlertDescription } from "@/components/ui/alert";
import { Warning } from "@phosphor-icons/react";

export function FormError({
	state,
	className,
}: {
	state?: { error: string };
	className?: string;
}) {
	return state?.error ? (
		<Alert variant="destructive" className={className}>
			<Warning weight="fill" className="h-4 w-4" />
			<AlertDescription className="mt-1">{state.error}</AlertDescription>
		</Alert>
	) : null;
}
