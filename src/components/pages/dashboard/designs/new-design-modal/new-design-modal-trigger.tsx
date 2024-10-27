"use client";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "@phosphor-icons/react";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";
import { useUploadContext } from "../upload-context";

export default function NewDesignModalTrigger({
	className,
}: {
	className?: string;
}) {
	const { newDesignId, uploadState } = useUploadContext();

	return (
		<DialogTrigger asChild>
			<Button size="sm" className={cn("gap-2", className)}>
				{newDesignId ? (
					<Spinner size={16} />
				) : (
					<Plus weight="bold" className="h-4 w-4" />
				)}
				{newDesignId ? "Uploading" : "Add Design"}
			</Button>
		</DialogTrigger>
	);
}
