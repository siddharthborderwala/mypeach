"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "../../ui/input";

export const SearchBar = () => {
	const [showedToast, setShowedToast] = useState(false);

	return (
		<div className="relative justify-self-center flex-1 w-[20rem]">
			<MagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search designs..."
				className="w-full rounded-lg bg-background pl-8"
				onKeyDown={() => {
					if (!showedToast) {
						toast.error("This feature is not available yet.");
						setShowedToast(true);
					}
				}}
			/>
		</div>
	);
};
