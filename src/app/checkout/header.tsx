import Link from "next/link";
import { UserMenu } from "@/components/user-menu";
import { getUserAuth } from "@/lib/auth/utils";
import { Button } from "@/components/ui/button";

export async function Header() {
	const { session } = await getUserAuth();

	return (
		<header className="sticky top-0 bg-white z-[1]">
			<div className="flex items-center justify-between md:gap-6 p-4">
				<div className="flex-1 flex justify-start">
					<Link href="/" className="w-auto flex items-center gap-1 font-medium">
						<img src="/logo.png" alt="Peach" className="h-10 w-10" />
						<span className="text-xl mt-1">Peach</span>
					</Link>
				</div>
				{session?.user.id ? (
					<div className="flex-1 flex items-center justify-end gap-4">
						<UserMenu
							userId={session.user.id}
							username={session.user.username}
						/>
					</div>
				) : (
					<>
						<nav className="flex-1 flex items-center justify-end gap-2">
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
