"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavItem({
	href,
	icon,
	label,
}: { href: string; icon: React.ReactNode; label: string }) {
	const pathname = usePathname();
	const isActive = pathname.startsWith(href);

	return (
		<Link
			href={href}
			className={cn(
				"flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
				isActive ? "bg-muted text-primary" : "",
			)}
		>
			{icon}
			{label}
		</Link>
	);
}

export function NavItemMobile({
	href,
	icon,
	label,
}: { href: string; icon: React.ReactNode; label: string }) {
	const pathname = usePathname();
	const isActive = pathname.startsWith(href);

	return (
		<Link
			href={href}
			className={cn(
				"mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
				isActive ? "bg-muted text-foreground" : "",
			)}
		>
			{icon}
			{label}
		</Link>
	);
}
