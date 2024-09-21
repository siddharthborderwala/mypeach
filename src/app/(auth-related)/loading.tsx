import { Spinner } from "@/components/spinner";

export default function Loading() {
	return (
		<div className="h-[100svh] w-[100svw] flex items-center justify-center">
			<Spinner color="#000" />
		</div>
	);
}
