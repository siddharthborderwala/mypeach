import Link from "next/link";
import {
	House,
	List as Menu,
	PaintBrush,
	Tag,
	ShoppingCart,
	Bookmark,
	Gear,
} from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getCurrentUser } from "@/lib/auth/utils";
import { NavItem, NavItemMobile } from "./nav";
import { UserMenu } from "@/components/user-menu";

const navItems = [
	{
		label: "Dashboard",
		href: "/home",
		icon: <House className="h-4 w-4" />,
	},
	{
		label: "Designs",
		href: "/designs",
		icon: <PaintBrush className="h-4 w-4" />,
	},
	{
		label: "Collections",
		href: "/collections",
		icon: <Bookmark className="h-4 w-4" />,
	},
	{
		label: "Sales",
		href: "/sales",
		icon: <Tag className="h-4 w-4" />,
	},
];

const secondaryNavItems = [
	{
		label: "Purchases",
		href: "/purchases",
		icon: <ShoppingCart className="h-4 w-4" />,
	},
];

export default async function Layout({
	children,
}: { children: React.ReactNode }) {
	const { id, username } = await getCurrentUser();

	return (
		<div className="grid h-[100svh] w-[100svw] overflow-hidden md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
			<style>
				{`
          body {
            overflow: hidden;
          }
        `}
			</style>
			<div className="hidden border-r bg-background md:block">
				<div className="flex h-full max-h-screen flex-col gap-2">
					<div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
						<Link href="/" className="flex items-center gap-1 font-semibold">
							<img src="/logo.png" alt="Peach" className="h-8 w-8" />
							<span className="text-lg mt-1">Peach</span>
						</Link>
					</div>
					<div className="flex-1">
						<nav className="flex flex-col py-4 px-2 text-sm font-medium lg:px-4 h-full">
							<section>
								{navItems.map((item) => (
									<NavItem key={item.href} {...item} />
								))}
							</section>
							<hr className="my-4" />
							<section>
								{secondaryNavItems.map((item) => (
									<NavItem key={item.href} {...item} />
								))}
							</section>
							<hr className="my-4" />
							<section>
								<NavItem
									key="settings"
									href="/settings"
									label="Settings"
									icon={<Gear className="h-4 w-4" />}
								/>
							</section>
						</nav>
					</div>
				</div>
			</div>
			<div className="flex flex-col">
				<header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 lg:justify-end">
					<Sheet>
						<SheetTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="shrink-0 md:hidden"
							>
								<Menu className="h-5 w-5" />
								<span className="sr-only">Toggle navigation menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent
							side="left"
							className="flex flex-col bg-background max-sm:w-full"
						>
							<Link href="/" className="flex items-center gap-2 font-semibold">
								<img src="/logo.png" alt="Peach" className="h-8 w-8" />
								<span className="text-lg mt-1">Peach</span>
							</Link>
							<nav className="grid gap-2 mt-4 text-base font-medium">
								<section>
									{navItems.map((item) => (
										<NavItemMobile key={item.href} {...item} />
									))}
								</section>
								<hr className="my-4" />
								<section>
									{secondaryNavItems.map((item) => (
										<NavItem key={item.href} {...item} />
									))}
								</section>
							</nav>
						</SheetContent>
					</Sheet>
					<UserMenu userId={id} username={username} />
				</header>
				{children}
			</div>
		</div>
	);
}
