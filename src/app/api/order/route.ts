import { NextResponse } from "next/server";
import { Cashfree } from "cashfree-pg";
import type { CreateOrderRequest, VendorSplit } from "cashfree-pg";
import { z } from "zod";
import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { getCashfreeReturnURL } from "@/lib/utils";

Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment =
	process.env.NODE_ENV === "production"
		? Cashfree.Environment.PRODUCTION
		: Cashfree.Environment.SANDBOX;

const createOrderValidator = z.object({
	amount: z.number(),
	cartId: z.number(),
});

async function createOrderWithDetails(orderData: {
	cartId: number;
	userId: string;
	amount: number;
	status: string;
}) {
	try {
		const result = await db.$transaction(async (tx) => {
			const user = await tx.user.findUnique({
				where: { id: orderData.userId },
			});

			if (!user) {
				throw new Error("User not found");
			}

			// Create the Vendor
			const order = await tx.order.create({
				data: {
					cartId: orderData.cartId,
					userId: orderData.userId,
					amount: orderData.amount,
					status: orderData.status,
				},
			});

			// Create the split for each vendor
			const designsInCart = await tx.cartProduct.findMany({
				where: { cartId: orderData.cartId },
				include: {
					design: {
						select: {
							vendorId: true,
							price: true,
						},
					},
				},
			});

			const splits: VendorSplit[] = [];

			for (const data of designsInCart) {
				if (
					splits.find(
						(split) => split.vendor_id === data.design.vendorId.toString(),
					)
				) {
					const index = splits.findIndex(
						(split) => split.vendor_id === data.design.vendorId.toString(),
					);

					if (splits[index].amount) {
						splits[index].amount += Math.floor(data.design.price * 0.8);
					}
				} else {
					splits.push({
						vendor_id: data.design.vendorId.toString(),
						amount: Math.floor(data.design.price * 0.8),
					});
				}
			}

			// Optionally, return all created records
			return { order, user, splits };
		});

		// Handle the result as needed
		console.log("Transaction successful:", result);
		return result;
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			// Handle known Prisma errors
			console.error("Prisma error:", error.message);
		} else {
			// Handle other types of errors
			console.error("Unexpected error:", error);
		}
		throw error; // Re-throw the error after logging
	}
}

async function updateOrderWithDetails(orderData: {
	id: number;
	cashFreeOrderId: string;
	paymentSessionId: string;
}) {
	try {
		const result = await db.$transaction(async (tx) => {
			const order = await tx.order.update({
				where: { id: orderData.id },
				data: {
					cashFreeOrderId: orderData.cashFreeOrderId,
					paymentSessionId: orderData.paymentSessionId,
				},
			});

			// Optionally, return all created records
			return { order };
		});

		// Handle the result as needed
		console.log("Transaction successful:", result);
		return result;
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			// Handle known Prisma errors
			console.error("Prisma error:", error.message);
		} else {
			// Handle other types of errors
			console.error("Unexpected error:", error);
		}
		throw error; // Re-throw the error after logging
	}
}

async function checkIfOrderAlreadyExists(cartId: number) {
	const order = await db.order.findFirst({
		where: { cartId },
	});

	if (order) {
		return order;
	}

	return null;
}

export async function POST(request: Request) {
	const { session } = await getUserAuth();
	if (!session) {
		return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
	}

	const body = await request.json();

	const result = createOrderValidator.safeParse(body);

	if (!result.success) {
		return NextResponse.json({ error: result.error.message }, { status: 400 });
	}

	try {
		const checkIfOrderExists = await checkIfOrderAlreadyExists(
			result.data.cartId,
		);

		if (checkIfOrderExists) {
			return NextResponse.json({
				paymentSessionId: checkIfOrderExists.paymentSessionId,
				orderId: checkIfOrderExists.id,
			});
		}

		const { order, splits, user } = await createOrderWithDetails({
			cartId: result.data.cartId,
			userId: session.user.id,
			amount: result.data.amount,
			status: "ACTIVE",
		});

		const option: CreateOrderRequest = {
			order_id: order.id.toString(),
			order_amount: result.data.amount,
			order_currency: "INR",
			customer_details: {
				customer_id: user.id,
				customer_email: user.email,
				customer_phone: "9999999999",
			},
			order_meta: {
				return_url: getCashfreeReturnURL(order.id),
				payment_methods: "cc,dc,upi",
			},
			order_splits: splits,
		};

		const response = await Cashfree.PGCreateOrder("2023-08-01", option);

		if (!response.data.cf_order_id || !response.data.payment_session_id) {
			throw new Error("Invalid response from Cashfree");
		}

		await updateOrderWithDetails({
			id: order.id,
			cashFreeOrderId: response.data.cf_order_id,
			paymentSessionId: response.data.payment_session_id,
		});

		return NextResponse.json({
			paymentSessionId: response.data.payment_session_id,
			orderId: order.id,
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Failed to generate signed URL" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: Request) {
	const { session } = await getUserAuth();
	if (!session) {
		return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
	}

	const url = new URL(request.url);
	const orderId = url.searchParams.get("order_id");

	if (!orderId) {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}

	try {
		const order = await db.order.findUnique({
			where: { id: Number(orderId), userId: session.user.id },
		});

		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		await Cashfree.PGTerminateOrder("2023-08-01", order.id.toString(), {
			order_status: "TERMINATED",
		});

		await db.order.delete({
			where: { id: Number(orderId) },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Failed to cancel order" },
			{ status: 500 },
		);
	}
}

export async function GET(request: Request) {
	const { session } = await getUserAuth();
	if (!session) {
		return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
	}

	const url = new URL(request.url);
	const orderId = url.searchParams.get("order_id");

	if (!orderId) {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}

	try {
		const order = await db.order.findUnique({
			where: { id: Number(orderId), userId: session.user.id },
		});

		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		return NextResponse.json(order);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Failed to get order status" },
			{ status: 500 },
		);
	}
}
