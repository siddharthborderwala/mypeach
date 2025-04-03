import Link from "next/link";
import {
	List,
	Headset,
	SignIn,
	UserPlus,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
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
				<DropdownMenuItem asChild>
					<Link href="/support" className="gap-3 h-11 !text-base">
						<Headset className="h-5 w-5" />
						<span>Support</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/login" className="gap-3 h-11 !text-base">
						<SignIn className="h-5 w-5" />
						<span>Login</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild className="h-11">
					<Link href="/register" className="gap-3 h-11 !text-base">
						<UserPlus className="h-5 w-5" />
						<span>Register</span>
					</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
