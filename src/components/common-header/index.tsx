import { validateRequest } from "@/lib/auth/lucia";
import { Button } from "../ui/button";
import Link from "next/link";
import { NavItem } from "./nav-item";

async function PrimaryButton() {
	const { session } = await validateRequest();

	return (
		<>
			{!session?.userId ? <NavItem href="/login" label="Login" /> : null}
			<Button asChild className="h-auto py-1.5 ml-4">
				<Link href={session?.userId ? "/home" : "/register"}>
					{session?.userId ? "Dashboard" : "Register"}
				</Link>
			</Button>
		</>
	);
}

const navItems = [
	{
		href: "/support",
		label: "Support",
	},
];

async function Header() {
	return (
		<nav className="flex items-center justify-between gap-2">
			{navItems.map((item) => (
				<NavItem key={item.href} href={item.href} label={item.label} />
			))}
			<PrimaryButton />
		</nav>
	);
}

export function CommonHeader() {
	return (
		<div className="flex items-center justify-between md:gap-6 p-4">
			<Link href="/" className="flex items-center gap-1 font-semibold">
				<img src="/logo.png" alt="Peach" className="h-10 w-10" />
				<span className="text-xl mt-1">Peach</span>
			</Link>
			<Header />
		</div>
	);
}
