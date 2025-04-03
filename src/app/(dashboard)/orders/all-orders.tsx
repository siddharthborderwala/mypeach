"use client";

import ImageWithFallback from "@/components/image-with-fallback";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	type CurrentUserOrdersProducts,
	getCurrentUserOrders,
} from "@/lib/actions/orders";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import { cn, formatPrice, relativeTime } from "@/lib/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryState } from "nuqs";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Package, DownloadSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function OrderThumbnails({
	products,
}: {
	products: CurrentUserOrdersProducts;
}) {
	const firstThree = products.slice(0, 3);

	return (
		<div className="flex">
			{firstThree.map((product, idx) => (
				<div
					key={product.design.id}
					className={cn(
						"w-10 h-10 rounded-md overflow-hidden border-2 border-background",
						idx !== 0 && "-ml-4",
					)}
				>
					<ImageWithFallback
						src={getDesignThumbnailURL(
							product.design.thumbnailFileStorageKey,
							1200,
						)}
						className="w-full h-full object-cover !m-0 !border-none"
					/>
				</div>
			))}
			{products.length > 3 && (
				<div className="w-10 h-10 rounded-md -ml-4 border-2 border-background bg-muted flex items-center justify-center text-sm font-medium">
					+{products.length - 3}
				</div>
			)}
		</div>
	);
}

export function AllOrders({
	initialData,
}: {
	initialData: Awaited<ReturnType<typeof getCurrentUserOrders>>;
}) {
	const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

	const { data: orders } = useQuery({
		queryKey: ["orders", page],
		queryFn: () =>
			getCurrentUserOrders({
				pagination: { page },
			}),
		placeholderData: keepPreviousData,
		initialData,
	});

	return (
		<main className="relative flex h-[calc(100svh-3.5rem)] flex-col gap-4 md:gap-6">
			<div className="flex items-center justify-between pt-4 px-4 md:pt-8 md:px-8">
				<h1 className="text-lg font-semibold md:text-2xl">Your Orders</h1>
			</div>
			<div className="px-4 md:px-8 h-[calc(100svh-8rem)] overflow-y-auto">
				{orders.orders.length > 0 ? (
					<>
						<Table>
							<TableHeader className="sticky top-0 left-0 bg-background z-10">
								<TableRow>
									<TableHead>Order ID</TableHead>
									<TableHead>Designs</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Total</TableHead>
									<TableHead className="text-right">Receipt</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orders.orders.map((order) => (
									<TableRow key={order.id}>
										<TableCell>{order.id}</TableCell>
										<TableCell>
											<OrderThumbnails products={order.cart.products} />
										</TableCell>
										<TableCell>
											<Tooltip>
												<TooltipTrigger>
													{relativeTime(order.createdAt)}
												</TooltipTrigger>
												<TooltipContent>
													{new Date(order.createdAt).toLocaleString()}
												</TooltipContent>
											</Tooltip>
										</TableCell>
										<TableCell>
											<span
												className={cn(
													"inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
													{
														"bg-green-50 text-green-700 ring-green-600/20":
															order.status === "PAID",
														"bg-yellow-50 text-yellow-700 ring-yellow-600/20":
															order.status === "ACTIVE",
														"bg-red-50 text-red-700 ring-red-600/20":
															order.status === "FAILED",
													},
												)}
											>
												{order.status}
											</span>
										</TableCell>
										<TableCell>{formatPrice(order.amount)}</TableCell>
										<TableCell className="text-right">
											<Button
												variant="outline"
												size="icon"
												onClick={() => {
													console.log(`Download receipt for order ${order.id}`);
												}}
												disabled={order.status !== "PAID"}
												className="ml-auto"
											>
												<DownloadSimple weight="bold" className="h-4 w-4" />
												<span className="sr-only">Download receipt</span>
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
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

									{[...Array(orders.pagination.totalPages)].map((_, i) => (
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
												if (page < orders.pagination.totalPages) {
													setPage(page + 1);
												}
											}}
											className={
												page >= orders.pagination.totalPages
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
							<Package className="text-muted-foreground" size={48} />
							<h3 className="text-2xl font-bold tracking-tight mt-4">
								You have no orders
							</h3>
							<p className="text-sm text-muted-foreground">
								Share your designs to start selling!
							</p>
							<Button className="mt-4" asChild>
								<Link href="/designs">My Designs</Link>
							</Button>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
