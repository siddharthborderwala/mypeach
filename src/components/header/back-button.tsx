"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CaretLeft } from "@phosphor-icons/react";

export function BackButton() {
	const router = useRouter();

	return (
		<Button
			variant="outline"
			className="sm:hidden absolute top-4 left-4 w-auto h-auto p-2.5 [&+a]:hidden"
			onClick={() => router.back()}
		>
			<CaretLeft weight="bold" className="h-5 w-5" />
			<span className="sr-only">Back</span>
		</Button>
	);
}
