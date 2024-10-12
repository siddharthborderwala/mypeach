"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "../../ui/input";

export const SearchBar = () => {
	return (
		<div className="relative justify-self-center flex-1 w-full">
			<MagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search designs..."
				className="w-full rounded-lg bg-background pl-8"
			/>
		</div>
	);
};
