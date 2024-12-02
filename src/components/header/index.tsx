import Link from "next/link";
import { SearchBar } from "@/components/pages/home/search-bar";
import { getUserAuth } from "@/lib/auth/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { UserMenu } from "@/components/user-menu";
import { getActiveCartAndProducts } from "@/lib/actions/cart";
import { SidebarCart } from "./sidebar-cart";
import { SearchButton } from "./search-button";
import { MobileMenu } from "./mobile-menu";
import SearchBarWrapper from "./SearchBarWrapper";

async function HeaderCartButton() {
	const initialData = await getActiveCartAndProducts();

	return <SidebarCart initialData={initialData} />;
}

export async function Header() {
	const { session } = await getUserAuth();

	return (
		<header className="sticky top-0 bg-background/80 backdrop-blur-sm z-[1]">
			<div className="flex items-center justify-between md:gap-6 p-4">
				<div className="shrink-0 flex-1 flex justify-start">
					<Link href="/" className="flex items-center gap-1 font-medium">
						<img src="/logo.png" alt="Peach" className="h-10 w-10" />
						<span className="text-xl mt-1">Peach</span>
					</Link>
				</div>
				<div className="hidden md:block">
					{<SearchBarWrapper component={<SearchBar />} />}
				</div>
				{session?.user.id ? (
					<div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
						<Button
							asChild
							size="sm"
							variant="outline"
							className="hidden md:flex text-sm font-normal gap-2 items-center"
						>
							<Link href="/designs?new=true">
								<span>Create</span>
								<Plus weight="bold" className="h-6 w-6 sm:h-5 sm:w-5" />
							</Link>
						</Button>
						{<SearchBarWrapper component={<SearchButton />} />}

						<HeaderCartButton />
						<UserMenu
							userId={session.user.id}
							username={session.user.username}
						/>
					</div>
				) : (
					<>
						<nav className="sm:hidden space-x-2">
							<HeaderCartButton />
							<MobileMenu />
						</nav>
						<nav className="hidden sm:flex flex-1 items-center justify-end gap-2">
							<HeaderCartButton />
							<Button asChild variant="ghost" className="text-base font-normal">
								<Link href="/support">Support</Link>
							</Button>
							<Button asChild variant="ghost" className="text-base font-normal">
								<Link href="/login">Login</Link>
							</Button>
							<Button
								asChild
								variant="default"
								className="text-base font-normal ml-3 rounded-lg"
							>
								<Link href="/register">Register</Link>
							</Button>
						</nav>
					</>
				)}
			</div>
		</header>
	);
}
