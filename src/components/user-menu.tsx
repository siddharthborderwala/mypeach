"use client";

import {
	SignOut,
	House,
	Gear,
	Headset,
	FileDashed,
	CaretDown,
} from "@phosphor-icons/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { signOutAction } from "@/lib/actions/users";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { getUserAvatarURL } from "@/lib/utils";

function LogoutButton() {
	const { pending } = useFormStatus();

	return (
		<Button
			type="submit"
			variant="ghost"
			className="w-full gap-2 items-center px-3 py-1 justify-start h-9 text-sm font-normal"
		>
			<SignOut />
			<span>Log{pending ? "ging" : ""} out</span>
		</Button>
	);
}

function Logout() {
	const [, formAction] = useFormState(signOutAction, null);

	return (
		<form action={formAction} className="w-full text-left">
			<DropdownMenuItem
				className="p-0"
				onSelect={(e) => {
					// Prevent the dropdown from closing
					e.preventDefault();
				}}
			>
				<LogoutButton />
			</DropdownMenuItem>
		</form>
	);
}

export function UserMenu({
	userId,
	username,
}: {
	userId: string;
	username: string;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="rounded-full p-1 group">
					<Avatar className="h-7 w-7">
						<AvatarImage src={getUserAvatarURL(username)} />
					</Avatar>
					<span className="sr-only">Toggle user menu</span>
					<CaretDown
						weight="bold"
						size={12}
						className="ml-1 group-hover:translate-y-[1px] transition-transform"
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem asChild>
					<Link href="/home">
						<House />
						<span className="ml-2">Dashboard</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/settings">
						<Gear />
						<span className="ml-2">Settings</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/support">
						<Headset />
						<span className="ml-2">Support</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/terms">
						<FileDashed />
						<span className="ml-2">Terms</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<Logout />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
