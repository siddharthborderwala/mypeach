import Link from "next/link";
import { SearchBar } from "@/components/pages/home/search-bar";
import { getUserAuth } from "@/lib/auth/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { UserMenu } from "@/components/user-menu";
import { getActiveCartAndProducts } from "@/lib/actions/cart";
import { SidebarCart } from "./sidebar-cart";

async function HeaderCartButton() {
	const initialData = await getActiveCartAndProducts();

	return <SidebarCart initialData={initialData} />;
}

export async function Header() {
	const { session } = await getUserAuth();

	return (
		<header className="sticky top-0 bg-white z-[1]">
			<div className="flex items-center justify-between md:gap-6 p-4">
				<div className="flex-1 flex justify-start">
					<Link href="/" className="w-min flex items-center gap-1 font-medium">
						<img src="/logo.png" alt="Peach" className="h-10 w-10" />
						<span className="text-xl mt-1">Peach</span>
					</Link>
				</div>
				<div className="flex-1">
					<SearchBar />
				</div>
				{session?.user.id ? (
					<div className="flex-1 flex items-center justify-end gap-4">
						<Button
							asChild
							size="sm"
							variant="outline"
							className="text-sm font-normal gap-2 items-center"
						>
							<Link href="/designs?new=true">
								<span>Create</span>
								<Plus weight="bold" />
							</Link>
						</Button>
						<HeaderCartButton />
						<UserMenu
							userId={session.user.id}
							username={session.user.username}
						/>
					</div>
				) : (
					<>
						<nav className="flex-1 flex items-center justify-end gap-2">
							<HeaderCartButton />
							<Button asChild variant="ghost" className="text-base font-normal">
								<Link href="/#explore">Explore</Link>
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
