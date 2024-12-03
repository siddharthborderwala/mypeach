"use client";

import { usePathname } from "next/navigation";

const SearchBarWrapper = ({
	component,
}: {
	component: React.ReactNode;
}) => {
	const pathname = usePathname();

	return pathname === "/" ? component : null;
};

export default SearchBarWrapper;
