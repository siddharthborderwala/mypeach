"use client";

import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "@phosphor-icons/react";

export default function NewDesignModalTrigger() {
	return (
		<DialogTrigger asChild>
			<Button className="gap-2">
				<Plus weight="bold" className="h-4 w-4" />
				Add Design
			</Button>
		</DialogTrigger>
	);
}
