import Link from "next/link";
import {
	House,
	ChartLineUp,
	List as Menu,
	MagnifyingGlass as Search,
	PaintBrush,
	Tag,
	ShoppingCart,
	CurrencyCircleDollar,
} from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { checkAuth } from "@/lib/auth/utils";
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
		label: "Sales",
		href: "/sales",
		icon: <Tag className="h-4 w-4" />,
	},
	{
		label: "Payouts",
		href: "/payouts",
		icon: <CurrencyCircleDollar className="h-4 w-4" />,
	},
	{
		label: "Analytics",
		href: "/analytics",
		icon: <ChartLineUp className="h-4 w-4" />,
	},
];

const secondaryNavItems = [
	{
		label: "Purchases",
		href: "/library",
		icon: <ShoppingCart className="h-4 w-4" />,
	},
];

export default async function Layout({
	children,
}: { children: React.ReactNode }) {
	await checkAuth();

	return (
		<div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
			<div className="hidden border-r bg-background md:block">
				<div className="flex h-full max-h-screen flex-col gap-2">
					<div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
						<Link href="/" className="flex items-center gap-1 font-semibold">
							<img src="/favicon.ico" alt="Peach" className="h-8 w-8" />
							<span className="text-lg mt-1">Peach</span>
						</Link>
					</div>
					<div className="flex-1">
						<nav className="grid items-start py-4 px-2 text-sm font-medium lg:px-4">
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
						</nav>
					</div>
					<div className="mt-auto p-4">
						<Card>
							<CardHeader className="p-2 pt-0 md:p-4">
								<CardTitle>Upgrade to Pro</CardTitle>
								<CardDescription>
									Unlock all features and get unlimited access to our support
									team.
								</CardDescription>
							</CardHeader>
							<CardContent className="p-2 pt-0 md:p-4 md:pt-0">
								<Button size="sm" className="w-full">
									Upgrade
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
			<div className="flex flex-col">
				<header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
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
								<img src="/favicon.ico" alt="Peach" className="h-8 w-8" />
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
							<div className="mt-auto">
								<Card>
									<CardHeader>
										<CardTitle>Upgrade to Pro</CardTitle>
										<CardDescription>
											Unlock all features and get unlimited access to our
											support team.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<Button size="sm" className="w-full">
											Upgrade
										</Button>
									</CardContent>
								</Card>
							</div>
						</SheetContent>
					</Sheet>
					<div className="w-full flex-1">
						<form>
							<div className="relative">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder="Search products..."
									className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
								/>
							</div>
						</form>
					</div>
					<UserMenu />
				</header>
				{children}
			</div>
		</div>
	);
}
