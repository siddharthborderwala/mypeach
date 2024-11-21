"use client";

import { toast } from "sonner";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "../ui/button";

export function SearchButton() {
	return (
		<Button
			variant="ghost"
			className="md:hidden text-sm h-auto p-2 font-normal gap-2 items-center relative"
			onClick={() => {
				toast.error("This feature is not available yet.");
			}}
		>
			<MagnifyingGlass size={20} />
			<span className="sr-only">Search</span>
		</Button>
	);
}
