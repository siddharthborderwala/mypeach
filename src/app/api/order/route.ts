// TODO: add the order to the DB

import { NextResponse } from "next/server";
import { Cashfree } from "cashfree-pg";
import type { CreateOrderRequest } from "cashfree-pg";
import { z } from "zod";
import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment =
	process.env.NODE_ENV === "production"
		? Cashfree.Environment.PRODUCTION
		: Cashfree.Environment.SANDBOX;

const createOrderValidator = z.object({
	price: z.number(),
	designIds: z.array(z.string()),
});

// FIXME: according to the new db schema
// Function to create order and retrieve vendor details
// async function createOrderWithDetails(orderData: {
// 	designIds: string[];
// 	userId: string;
// 	price: number;
// 	status: string;
// }) {
// 	try {
// 		const result = await db.$transaction(async (tx) => {
// 			const user = await tx.user.findUnique({
// 				where: { id: orderData.userId },
// 			});

// 			if (!user) {
// 				throw new Error("User not found");
// 			}

// 			// Retrieve the Vendor details with the Vendor ID
// 			const vendor = await tx.vendor.findUnique({
// 				where: { userId: orderData.userId },
// 			});

// 			if (!vendor) {
// 				throw new Error("Vendor not found");
// 			}

// 			// Create the Vendor
// 			const order = await db.order.create({
// 				data: {
// 					designs: {
// 						connect: orderData.designIds.map((id) => ({ id })),
// 					},
// 					userId: orderData.userId,
// 					vendors: {
// 						connect: { id: vendor.id },
// 					},
// 					price: orderData.price,
// 					status: orderData.status,
// 				},
// 			});

// 			// Optionally, return all created records
// 			return { order, vendor, user };
// 		});

// 		// Handle the result as needed
// 		console.log("Transaction successful:", result);
// 		return result;
// 	} catch (error) {
// 		if (error instanceof PrismaClientKnownRequestError) {
// 			// Handle known Prisma errors
// 			console.error("Prisma error:", error.message);
// 		} else {
// 			// Handle other types of errors
// 			console.error("Unexpected error:", error);
// 		}
// 		throw error; // Re-throw the error after logging
// 	}
// }

// FIXME: according to the new db schema
// async function updateOrderWithDetails(orderData: {
// 	id: number;
// 	cashFreeOrderId: string;
// 	paymentSessionId: string;
// 	percentageSplitToVendor: number;
// }) {
// 	try {
// 		const result = await db.$transaction(async (tx) => {
// 			const order = await tx.order.update({
// 				where: { id: orderData.id },
// 				data: {
// 					cashFreeOrderId: orderData.cashFreeOrderId,
// 					paymentSessionId: orderData.paymentSessionId,
// 					percentageSplitToVendor: orderData.percentageSplitToVendor,
// 				},
// 			});

// 			// Optionally, return all created records
// 			return { order };
// 		});

// 		// Handle the result as needed
// 		console.log("Transaction successful:", result);
// 		return result;
// 	} catch (error) {
// 		if (error instanceof PrismaClientKnownRequestError) {
// 			// Handle known Prisma errors
// 			console.error("Prisma error:", error.message);
// 		} else {
// 			// Handle other types of errors
// 			console.error("Unexpected error:", error);
// 		}
// 		throw error; // Re-throw the error after logging
// 	}
// }

// FIXME: according to the new db schema
// export async function POST(request: Request) {
// 	const { session } = await getUserAuth();
// 	if (!session) {
// 		return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
// 	}

// 	const body = await request.json();

// 	const result = createOrderValidator.safeParse(body);

// 	if (!result.success) {
// 		return NextResponse.json({ error: result.error.message }, { status: 400 });
// 	}

// 	try {
// 		const { order, vendor, user } = await createOrderWithDetails({
// 			designIds: result.data.designIds,
// 			userId: session.user.id,
// 			price: result.data.price,
// 			status: "ACTIVE",
// 		});

// 		const option: CreateOrderRequest = {
// 			order_id: order.id.toString(),
// 			order_amount: result.data.price,
// 			order_currency: "INR",
// 			customer_details: {
// 				customer_id: user.id,
// 				customer_email: user.email,
// 				customer_phone: "9999999999",
// 			},
// 			order_meta: {
// 				return_url: `${process.env.CASHFREE_RETURN_URL}?order_id=${order.id}`,
// 				payment_methods: "cc,dc,upi",
// 			},
// 			order_splits: [
// 				{
// 					vendor_id: vendor.id.toString(),
// 					percentage: 80,
// 				},
// 			],
// 		};

// 		const response = await Cashfree.PGCreateOrder("2023-08-01", option);

// 		if (
// 			!response.data.cf_order_id ||
// 			!response.data.payment_session_id ||
// 			!response.data.order_expiry_time
// 		) {
// 			throw new Error("Invalid response from Cashfree");
// 		}

// 		await updateOrderWithDetails({
// 			id: order.id,
// 			cashFreeOrderId: response.data.cf_order_id,
// 			paymentSessionId: response.data.payment_session_id,
// 			percentageSplitToVendor: 80,
// 		});

// 		return NextResponse.json({ data: response.data });
// 	} catch (error) {
// 		console.error(error);
// 		return NextResponse.json(
// 			{ error: "Failed to generate signed URL" },
// 			{ status: 500 },
// 		);
// 	}
// }
