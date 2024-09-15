import { Alert, AlertDescription } from "@/components/ui/alert";
import { Warning } from "@phosphor-icons/react";

export function FormError({ state }: { state?: { error: string } }) {
	return state?.error ? (
		<Alert variant="destructive">
			<Warning weight="fill" className="h-4 w-4" />
			<AlertDescription className="mt-1">{state.error}</AlertDescription>
		</Alert>
	) : null;
}
