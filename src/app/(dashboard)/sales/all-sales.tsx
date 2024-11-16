"use client";

import ImageWithFallback from "@/components/image-with-fallback";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCurrentUserSales } from "@/lib/actions/sales";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import { cn, formatPrice, relativeTime } from "@/lib/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { HandCoins, MagnifyingGlass, SmileyMeh } from "@phosphor-icons/react";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function SearchInput() {
	const [search, setSearch] = useQueryState("q", parseAsString);

	return (
		<div className="relative">
			<Input
				name="q"
				placeholder="Enter design name or order ID..."
				className="pl-10 w-[18rem]"
				value={search ?? ""}
				onChange={(e) => {
					if (e.target.value === "") {
						setSearch(null);
					} else {
						setSearch(e.target.value);
					}
				}}
			/>
			<MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
		</div>
	);
}

export function AllSales({
	initialData,
}: {
	initialData: Awaited<ReturnType<typeof getCurrentUserSales>>;
}) {
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [search, setSearch] = useQueryState("q", parseAsString);

	const debouncedSearch = useDebounce(search, 250);

	const { data: sales } = useQuery({
		queryKey: ["sales", page, debouncedSearch],
		queryFn: () =>
			getCurrentUserSales({
				search: debouncedSearch ?? undefined,
				pagination: { page },
			}),
		placeholderData: keepPreviousData,
		initialData,
	});

	return (
		<main className="relative flex h-[calc(100svh-3.5rem)] flex-col gap-4 md:gap-6">
			<div className="flex items-center justify-between pt-4 px-4 md:pt-8 md:px-8">
				<h1 className="text-lg font-semibold md:text-2xl">Your Sales</h1>
				<div className="flex items-center gap-2">
					<SearchInput />
				</div>
			</div>
			<div className="px-4 md:px-8 h-[calc(100svh-8rem)] overflow-y-auto">
				{sales.sales.length > 0 ? (
					<>
						<Table>
							<TableHeader className="sticky top-0 left-0 bg-background z-10">
								<TableRow>
									<TableHead>Sale ID</TableHead>
									<TableHead>Design</TableHead>
									<TableHead>Date</TableHead>
									<TableHead className="text-right">Amount</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sales.sales.map((sale) => (
									<TableRow key={sale.id}>
										<TableCell>{sale.id}</TableCell>
										<TableCell className="font-medium">
											<Link
												href={`/designs/?design=${sale.design.id}`}
												className="flex items-center group"
											>
												<div className="w-10 h-10 rounded-md">
													<ImageWithFallback
														src={getDesignThumbnailURL(
															sale.design.thumbnailFileStorageKey,
															1200,
														)}
														className="w-full h-full rounded-md object-cover"
													/>
												</div>
												<p className="ml-2 group-hover:underline">
													{sale.design.name}
												</p>
											</Link>
										</TableCell>
										<TableCell>
											<Tooltip>
												<TooltipTrigger>
													{relativeTime(sale.createdAt)}
												</TooltipTrigger>
												<TooltipContent>
													{new Date(sale.createdAt).toLocaleString()}
												</TooltipContent>
											</Tooltip>
										</TableCell>
										<TableCell>{formatPrice(sale.amount)}</TableCell>
									</TableRow>
								))}
							</TableBody>
							<TableFooter>
								<TableRow>
									<TableCell colSpan={3}>Total</TableCell>
									<TableCell className="text-right">
										{formatPrice(
											sales.sales.reduce((acc, curr) => acc + curr.amount, 0),
										)}
									</TableCell>
								</TableRow>
							</TableFooter>
						</Table>
						<div className="my-4">
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											onClick={(e) => {
												e.preventDefault();
												if (page > 1) setPage(page - 1);
											}}
											className={
												page <= 1 ? "pointer-events-none opacity-50" : ""
											}
										/>
									</PaginationItem>

									{[...Array(sales.pagination.totalPages)].map((_, i) => (
										<PaginationItem key={i + 1}>
											<PaginationLink
												onClick={(e) => {
													e.preventDefault();
													setPage(i + 1);
												}}
												isActive={page === i + 1}
											>
												{i + 1}
											</PaginationLink>
										</PaginationItem>
									))}

									<PaginationItem>
										<PaginationNext
											onClick={(e) => {
												e.preventDefault();
												if (page < sales.pagination.totalPages) {
													setPage(page + 1);
												}
											}}
											className={
												page >= sales.pagination.totalPages
													? "pointer-events-none opacity-50"
													: ""
											}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					</>
				) : (
					<div className="h-[calc(100%-1rem)] md:h-[calc(100%-1.5rem)] flex items-center justify-center rounded-lg border border-dashed shadow-sm">
						<div className="flex flex-col items-center gap-1 text-center">
							{debouncedSearch ? (
								<SmileyMeh className="text-muted-foreground" size={48} />
							) : (
								<HandCoins className="text-muted-foreground" size={48} />
							)}
							<h3 className="text-2xl font-bold tracking-tight mt-4">
								{debouncedSearch ? "Oops" : "You have no sales"}
							</h3>
							<p className="text-sm text-muted-foreground">
								{debouncedSearch
									? "No sales found for your search!"
									: "Share your designs to start selling!"}
							</p>
							{debouncedSearch ? (
								<Button
									variant="outline"
									className="mt-4"
									onClick={() => setSearch(null)}
								>
									View All
								</Button>
							) : (
								<Button className="mt-4" asChild>
									<Link href="/designs">My Designs</Link>
								</Button>
							)}
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
