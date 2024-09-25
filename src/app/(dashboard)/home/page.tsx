import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Plus } from "@phosphor-icons/react/dist/ssr";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Overview } from "./overview";

export const metadata: Metadata = {
	title: "Dashboard | Peach",
};

export default function Home() {
	return (
		<main className="flex h-[calc(100svh-3.5rem)] flex-col gap-4 p-4 md:gap-6 md:p-8 overflow-y-auto">
			<div className="flex items-center justify-between">
				<h1 className="text-lg font-semibold md:text-2xl">
					Welcome back to Peach
				</h1>
				<Button className="gap-2" asChild>
					<Link href="/designs/new">
						<Plus weight="bold" className="h-4 w-4" />
						Add Design
					</Link>
				</Button>
			</div>
			<Overview />
			<div className="grid gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
				<Card className="xl:col-span-2">
					<CardHeader className="flex flex-row items-center">
						<div className="grid gap-2">
							<CardTitle>Sales</CardTitle>
							<CardDescription>
								Recent sales from your peach store.
							</CardDescription>
						</div>
						<Button asChild size="sm" className="ml-auto gap-1">
							<Link href="#">
								View All
								<ArrowUpRight className="h-4 w-4" />
							</Link>
						</Button>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Designs</TableHead>
									<TableHead className="hidden xl:table-column">Type</TableHead>
									<TableHead className="hidden xl:table-column">
										Status
									</TableHead>
									<TableHead className="hidden xl:table-column">Date</TableHead>
									<TableHead className="text-right">Amount</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<TableRow>
									<TableCell>
										<div className="font-medium">Liam Johnson</div>
										<div className="hidden text-sm text-muted-foreground md:inline">
											liam@example.com
										</div>
									</TableCell>
									<TableCell className="hidden xl:table-column">Sale</TableCell>
									<TableCell className="hidden xl:table-column">
										<Badge className="text-xs" variant="outline">
											Approved
										</Badge>
									</TableCell>
									<TableCell className="hidden md:table-cell lg:hidden xl:table-column">
										2023-06-23
									</TableCell>
									<TableCell className="text-right">$250.00</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>
										<div className="font-medium">Olivia Smith</div>
										<div className="hidden text-sm text-muted-foreground md:inline">
											olivia@example.com
										</div>
									</TableCell>
									<TableCell className="hidden xl:table-column">
										Refund
									</TableCell>
									<TableCell className="hidden xl:table-column">
										<Badge className="text-xs" variant="outline">
											Declined
										</Badge>
									</TableCell>
									<TableCell className="hidden md:table-cell lg:hidden xl:table-column">
										2023-06-24
									</TableCell>
									<TableCell className="text-right">$150.00</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>
										<div className="font-medium">Noah Williams</div>
										<div className="hidden text-sm text-muted-foreground md:inline">
											noah@example.com
										</div>
									</TableCell>
									<TableCell className="hidden xl:table-column">
										Subscription
									</TableCell>
									<TableCell className="hidden xl:table-column">
										<Badge className="text-xs" variant="outline">
											Approved
										</Badge>
									</TableCell>
									<TableCell className="hidden md:table-cell lg:hidden xl:table-column">
										2023-06-25
									</TableCell>
									<TableCell className="text-right">$350.00</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>
										<div className="font-medium">Emma Brown</div>
										<div className="hidden text-sm text-muted-foreground md:inline">
											emma@example.com
										</div>
									</TableCell>
									<TableCell className="hidden xl:table-column">Sale</TableCell>
									<TableCell className="hidden xl:table-column">
										<Badge className="text-xs" variant="outline">
											Approved
										</Badge>
									</TableCell>
									<TableCell className="hidden md:table-cell lg:hidden xl:table-column">
										2023-06-26
									</TableCell>
									<TableCell className="text-right">$450.00</TableCell>
								</TableRow>
								<TableRow>
									<TableCell>
										<div className="font-medium">Liam Johnson</div>
										<div className="hidden text-sm text-muted-foreground md:inline">
											liam@example.com
										</div>
									</TableCell>
									<TableCell className="hidden xl:table-column">Sale</TableCell>
									<TableCell className="hidden xl:table-column">
										<Badge className="text-xs" variant="outline">
											Approved
										</Badge>
									</TableCell>
									<TableCell className="hidden md:table-cell lg:hidden xl:table-column">
										2023-06-27
									</TableCell>
									<TableCell className="text-right">$550.00</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Recent Sales</CardTitle>
					</CardHeader>
					<CardContent className="grid gap-8">
						<div className="flex items-center gap-4">
							<Avatar className="hidden h-9 w-9 sm:flex">
								<AvatarImage src="/avatars/01.png" alt="Avatar" />
								<AvatarFallback>OM</AvatarFallback>
							</Avatar>
							<div className="grid gap-1">
								<p className="text-sm font-medium leading-none">
									Olivia Martin
								</p>
								<p className="text-sm text-muted-foreground">
									olivia.martin@email.com
								</p>
							</div>
							<div className="ml-auto font-medium">+$1,999.00</div>
						</div>
						<div className="flex items-center gap-4">
							<Avatar className="hidden h-9 w-9 sm:flex">
								<AvatarImage src="/avatars/02.png" alt="Avatar" />
								<AvatarFallback>JL</AvatarFallback>
							</Avatar>
							<div className="grid gap-1">
								<p className="text-sm font-medium leading-none">Jackson Lee</p>
								<p className="text-sm text-muted-foreground">
									jackson.lee@email.com
								</p>
							</div>
							<div className="ml-auto font-medium">+$39.00</div>
						</div>
						<div className="flex items-center gap-4">
							<Avatar className="hidden h-9 w-9 sm:flex">
								<AvatarImage src="/avatars/03.png" alt="Avatar" />
								<AvatarFallback>IN</AvatarFallback>
							</Avatar>
							<div className="grid gap-1">
								<p className="text-sm font-medium leading-none">
									Isabella Nguyen
								</p>
								<p className="text-sm text-muted-foreground">
									isabella.nguyen@email.com
								</p>
							</div>
							<div className="ml-auto font-medium">+$299.00</div>
						</div>
						<div className="flex items-center gap-4">
							<Avatar className="hidden h-9 w-9 sm:flex">
								<AvatarImage src="/avatars/04.png" alt="Avatar" />
								<AvatarFallback>WK</AvatarFallback>
							</Avatar>
							<div className="grid gap-1">
								<p className="text-sm font-medium leading-none">William Kim</p>
								<p className="text-sm text-muted-foreground">will@email.com</p>
							</div>
							<div className="ml-auto font-medium">+$99.00</div>
						</div>
						<div className="flex items-center gap-4">
							<Avatar className="hidden h-9 w-9 sm:flex">
								<AvatarImage src="/avatars/05.png" alt="Avatar" />
								<AvatarFallback>SD</AvatarFallback>
							</Avatar>
							<div className="grid gap-1">
								<p className="text-sm font-medium leading-none">Sofia Davis</p>
								<p className="text-sm text-muted-foreground">
									sofia.davis@email.com
								</p>
							</div>
							<div className="ml-auto font-medium">+$39.00</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
