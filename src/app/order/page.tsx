"use client";

import { useQuery } from "@tanstack/react-query";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Spinner, XCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function Order() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const orderId = searchParams.get("orderId");
	const noOrderId = searchParams.get("error");
	const [refetchInterval, setRefetchInterval] = useState(2000);
	const [showRedirectToPurchases, setShowRedirectToPurchases] = useState(false);

	// Handle the scenario where orderId is missing
	useEffect(() => {
		if (!orderId) {
			// Redirect to the home page with an error message
			router.push("/?error=missing-order-id");
		}
	}, [orderId, router]);

	// Using useQuery to fetch and manage the order data
	const {
		data: order,
		error,
		isLoading,
	} = useQuery({
		queryKey: ["get-order", orderId],
		queryFn: async () => {
			const res = await fetch(
				`/api/order?${new URLSearchParams({
					order_id: orderId as string,
				}).toString()}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			return res.json();
		},
		refetchInterval,
		enabled: !!orderId,
	});

	useEffect(() => {
		if (order) {
			if (order.status === "PAID" || order.status === "FAILED") {
				setRefetchInterval(0);
			}

			if (order.status === "PAID") {
				redirect("/purchases");
			}

			if (order.status === "ACTIVE") {
				setTimeout(() => {
					setShowRedirectToPurchases(true);
				}, 5000);
			}
		}
	}, [order]);

	// Display a loading indicator while the data is being fetched
	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<div className="text-xl">Loading...</div>
				<Spinner color="#000" className="animate-spin mt-2" />
			</div>
		);
	}

	if (noOrderId || !orderId || !order) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<div className="text-lg text-red-500">No Order found</div>
				<Button className="mt-4" onClick={() => router.push("/")}>
					Go Home
				</Button>
			</div>
		);
	}

	// Display an error message if the fetch fails
	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<div className="text-red-600 text-lg mb-4">Error: {error.message}</div>
				<Button onClick={() => router.push("/checkout")} className="mt-4">
					Retry Checkout
				</Button>
			</div>
		);
	}

	// Render different UI based on the order status
	if (order.status === "ACTIVE") {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<div className="text-xl mb-4">Order is being processed...</div>
				<Spinner color="#000" className="animate-spin mt-2" />

				{showRedirectToPurchases && (
					<div className="mt-10 flex flex-col items-center">
						<p>
							It's taking longer than expected. You can continue to check the
							status in Purchases.
						</p>
						<Button onClick={() => router.push("/purchases")} className="mt-4">
							Go to Purchases
						</Button>
					</div>
				)}
			</div>
		);
	}

	if (order.status === "PAID") {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<CheckCircle size={64} weight="fill" color="green" />
				<p className="mt-4 text-2xl">Your order has been paid!</p>
				<div className="mt-6 flex space-x-4">
					<Button
						onClick={() => router.push("/purchases")}
						className="bg-green-500 hover:bg-green-600"
					>
						Go to Purchases
					</Button>
					<Button
						onClick={() => router.push("/download")}
						className="bg-blue-500 hover:bg-blue-600"
					>
						Download
					</Button>
				</div>
			</div>
		);
	}

	if (order.status === "FAILED") {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<XCircle size={64} weight="fill" color="red" />
				<p className="mt-4 text-2xl">
					Your order has failed: {order.failedReason}
				</p>
				<Button onClick={() => router.push("/cart")} className="mt-4">
					Go to Cart
				</Button>
			</div>
		);
	}

	// Handle any other unexpected statuses
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4">
			<p className="text-lg">Unknown order status</p>
			<Button onClick={() => router.push("/")} className="mt-4">
				Go Home
			</Button>
		</div>
	);
}

export default Order;
