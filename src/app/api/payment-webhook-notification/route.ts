import { db } from "@/lib/db";
import { CartStatus } from "@/lib/db/schema/cart";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { AxiosError } from "axios";
import { Cashfree } from "cashfree-pg";
import type { PaymentWebhookDataEntity, VendorSplit } from "cashfree-pg";
import { NextResponse } from "next/server";

Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment =
	process.env.NODE_ENV === "production"
		? Cashfree.Environment.PRODUCTION
		: Cashfree.Environment.SANDBOX;

async function updateOrderStatus({
	order: orderData,
	payment,
	error_details,
}: PaymentWebhookDataEntity) {
	try {
		if (!orderData) {
			throw new Error("Invalid order data");
		}

		const result = await db.$transaction(async (tx) => {
			if (!orderData.order_id) {
				throw new Error("Invalid order ID");
			}

			if (!payment) {
				throw new Error("Invalid payment data");
			}

			// Update the order status
			const order = await tx.order.update({
				where: {
					id: Number.parseInt(orderData.order_id),
				},
				data: {
					status:
						payment.payment_status === "SUCCESS"
							? "PAID"
							: payment.payment_status === "FAILED"
								? "FAILED"
								: "ACTIVE",
					bankReference: payment.bank_reference,
					cashFreePaymentId: payment.cf_payment_id,
					paymentFailed: payment.payment_status === "FAILED",
					failedReason: error_details?.error_description,
				},
				include: {
					cart: {
						include: {
							products: {
								include: {
									design: {
										include: {
											vendor: {
												select: {
													id: true,
												},
											},
										},
									},
								},
							},
						},
					},
				},
			});

			if (!order.cart) {
				throw new Error("Invalid cart data");
			}

			if (payment.payment_status === "SUCCESS") {
				await tx.cart.update({
					where: {
						id: order.cartId,
					},
					data: {
						status: CartStatus.ORDERED,
					},
				});

				const designsInCart = await tx.cartProduct.findMany({
					where: { cartId: order.cartId },
					include: {
						design: {
							select: {
								vendorId: true,
								price: true,
							},
						},
					},
				});

				// add the design as a purchase
				await tx.purchasedDesign.createMany({
					data: designsInCart.map((data) => ({
						userId: order.userId,
						designId: data.designId,
					})),
				});

				// Update the sales table
				await tx.sales.createMany({
					data: designsInCart.map((data) => ({
						amount: Math.floor(data.design.price * 0.8),
						vendorId: data.design.vendorId,
						designId: data.designId,
					})),
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

				// Update totalEarnings for each vendor
				for (const split of splits) {
					await tx.vendor.update({
						where: {
							id: Number.parseInt(split.vendor_id),
						},
						data: {
							totalEarnings: {
								increment: split.amount,
							},
						},
					});
				}
			}

			return;
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

export async function POST(request: Request) {
	try {
		const signature = request.headers.get("x-webhook-signature");
		const timestamp = request.headers.get("x-webhook-timestamp");
		const rawBody = await request.text();

		if (!signature || !timestamp || !rawBody) {
			return NextResponse.json(
				{ error: "Invalid request body" },
				{ status: 400 },
			);
		}

		const response = Cashfree.PGVerifyWebhookSignature(
			signature,
			rawBody,
			timestamp,
		);

		await updateOrderStatus(response.object.data);

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		console.log(error);
		if (error instanceof AxiosError || error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "An unknown error occurred" },
			{ status: 500 },
		);
	}
}

export async function OPTIONS(request: Request) {
	return new NextResponse(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers":
				"Content-Type, x-webhook-signature, x-webhook-timestamp",
		},
	});
}
