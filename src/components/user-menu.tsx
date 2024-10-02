"use client";

import { SignOut, UserCircle } from "@phosphor-icons/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { signOutAction } from "@/lib/actions/users";
import { useFormStatus } from "react-dom";
import Link from "next/link";

function LogoutButton() {
	const { pending } = useFormStatus();

	return (
		<form action={signOutAction} className="w-full text-left">
			<DropdownMenuItem>
				<Button
					type="submit"
					variant="ghost"
					className="w-full gap-2 items-center justify-start h-auto p-0 font-normal"
				>
					<SignOut />
					<span>Log{pending ? "ing" : ""} out</span>
				</Button>
			</DropdownMenuItem>
		</form>
	);
}

export function UserMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="secondary" size="icon" className="rounded-full">
					<UserCircle className="h-5 w-5" />
					<span className="sr-only">Toggle user menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/settings">Settings</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/support">Support</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<LogoutButton />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
