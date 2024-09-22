"use client";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "@phosphor-icons/react";
import { designIdAtom } from "./atoms";
import { useAtomValue } from "jotai";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

export default function NewDesignModalTrigger({
	className,
}: {
	className?: string;
}) {
	const uploadingDesignId = useAtomValue(designIdAtom);

	return (
		<DialogTrigger asChild>
			<Button className={cn("gap-2", className)}>
				{uploadingDesignId ? (
					<Spinner size={16} />
				) : (
					<Plus weight="bold" className="h-4 w-4" />
				)}
				{uploadingDesignId ? "Uploading" : "Add Design"}
			</Button>
		</DialogTrigger>
	);
}
