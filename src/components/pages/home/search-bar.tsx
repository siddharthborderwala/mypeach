"use client";

import { useEffect, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "../../ui/input";

export const SearchBar = () => {
	const [searchQuery, setSearchQuery] = useQueryState("q", parseAsString);

	const [searchTerm, setSearchTerm] = useState(searchQuery ?? "");

	// Debounce the search term to avoid too many updates
	const debouncedSearch = useDebounce(searchTerm, 300);

	useEffect(() => {
		const cleanSearchTerm = debouncedSearch.trim();
		if (cleanSearchTerm) {
			setSearchQuery(cleanSearchTerm);
		} else {
			setSearchQuery(null);
		}
	}, [debouncedSearch, setSearchQuery]);

	return (
		<div className="relative justify-self-center flex-1 w-[20rem]">
			<MagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search designs..."
				className="w-full rounded-lg bg-background pl-8"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
			/>
		</div>
	);
};
