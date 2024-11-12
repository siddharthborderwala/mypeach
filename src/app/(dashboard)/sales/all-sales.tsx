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
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useDebounce } from "@/hooks/use-debounce";

function SearchInput() {
	const [search, setSearch] = useQueryState("q", parseAsString);

	return (
		<div className="w-full max-w-sm relative">
			<Input
				name="q"
				placeholder="Enter design name or order ID..."
				className="pl-10"
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
	const [search] = useQueryState("q", parseAsString);

	const debouncedSearch = useDebounce(search, 250);

	console.log(debouncedSearch);

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
			<div className="px-4 md:px-8 h-[calc(100svh-5.5rem)] overflow-y-auto">
				<Table>
					<TableHeader className="sticky top-0 left-0 bg-background z-10">
						<TableRow>
							<TableHead>Design</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead className="text-right">Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sales.sales.map((design) => (
							<TableRow key={design.cartProducts[0].cart.order!.id + design.id}>
								<TableCell className="font-medium">
									<div className="flex items-center">
										<div className="w-10 h-10 rounded-md">
											<ImageWithFallback
												src={getDesignThumbnailURL(
													design.thumbnailFileStorageKey,
													1200,
												)}
												className="w-full h-full rounded-md object-cover"
											/>
										</div>
										<p className="ml-2">{design.name}</p>
									</div>
								</TableCell>
								<TableCell>
									<Tooltip>
										<TooltipTrigger>
											{relativeTime(
												design.cartProducts[0].cart.order!.createdAt,
											)}
										</TooltipTrigger>
										<TooltipContent>
											{new Date(
												design.cartProducts[0].cart.order!.createdAt,
											).toLocaleString()}
										</TooltipContent>
									</Tooltip>
								</TableCell>
								<TableCell>
									{formatPrice(design.cartProducts[0].cart.order!.amount)}
								</TableCell>
								<TableCell
									className={cn(
										"text-right font-medium",
										design.cartProducts[0].cart.order!.status === "PAID"
											? "text-success"
											: "text-warning",
									)}
								>
									{design.cartProducts[0].cart.order!.status}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableCell colSpan={3}>Total</TableCell>
							<TableCell className="text-right">
								{formatPrice(
									sales.sales.reduce(
										(acc, curr) =>
											acc + curr.cartProducts[0].cart.order!.amount,
										0,
									),
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
									className={page <= 1 ? "pointer-events-none opacity-50" : ""}
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
			</div>
		</main>
	);
}
