import Link from "next/link";
import { List, Headset, SignIn } from "@phosphor-icons/react/dist/ssr";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function MobileMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="text-sm h-auto p-2 font-normal gap-2 items-center relative"
				>
					<List className="h-6 w-6 sm:h-5 sm:w-5" />
					<span className="sr-only">Toggle menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[160px]">
				<DropdownMenuItem asChild className="gap-3">
					<Link href="/support">
						<Headset />
						<span>Support</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/login" className="gap-3">
						<SignIn />
						<span>Login</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem
					asChild
					className="bg-primary text-primary-foreground hover:bg-primary/90"
				>
					<Link href="/register">Register</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
