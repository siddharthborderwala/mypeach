"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Input } from "../../ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

export const SearchBar = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

	// Debounce the search term to avoid too many updates
	const debouncedSearch = useDebounce(searchTerm, 300);

	// Update URL when debounced search term changes
	useEffect(() => {
		const params = new URLSearchParams(searchParams);

		if (debouncedSearch) {
			params.set("q", debouncedSearch);
		} else {
			params.delete("q");
		}
		router.push(`/?${params.toString()}`);
	}, [debouncedSearch, router, searchParams]);

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
