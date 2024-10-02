"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const NavItem = ({ href, label }: { href: string; label: string }) => {
	const pathname = usePathname();
	const isActive = pathname === href;

	return (
		<Button
			variant="link"
			asChild
			className={cn(
				"h-auto py-1.5",
				isActive ? "text-primary" : "text-foreground",
			)}
		>
			<Link href={href}>{label}</Link>
		</Button>
	);
};
