"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getUserId } from "../auth/utils";
import type { FileMetadata } from "./designs";
import { CartStatus } from "../db/schema/cart";
import { appBaseURL } from "../utils";

async function deleteOrder(orderId: number | undefined) {
	if (!orderId) return;
	try {
		await axios.delete(`${appBaseURL}/api/order?order_id=${orderId}`, {
			headers: {
				cookie: cookies().toString(),
			},
		});
	} catch (error) {
		console.error(error);
	}
}

export async function addItemAction(designId: string) {
	const userId = await getUserId();

	const data = await db.$transaction(async (tx) => {
		// 1. check if there is a cart for the user, if not create one
		const _cart = await tx.cart.findFirst({
			where: {
				userId,
				status: CartStatus.ACTIVE,
			},
		});

		const cart = !_cart
			? await tx.cart.create({
					data: {
						userId,
					},
				})
			: _cart;

		// get order if it exists
		const order = await tx.order.findFirst({
			where: {
				cartId: cart.id,
			},
		});

		await tx.cartProduct.upsert({
			where: {
				cartId_designId: {
					cartId: cart.id,
					designId,
				},
			},
			update: {},
			create: {
				cartId: cart.id,
				designId,
			},
		});

		return { order };
	});

	await deleteOrder(data.order?.id);

	return null;
}

export async function removeItemAction(designId: string) {
	const userId = await getUserId();

	const data = await db.$transaction(async (tx) => {
		const cart = await tx.cart.findFirst({
			where: {
				userId,
				status: CartStatus.ACTIVE,
			},
		});

		if (!cart) return;

		// get order if it exists
		const order = await tx.order.findFirst({
			where: {
				cartId: cart.id,
			},
		});

		await tx.cartProduct.delete({
			where: {
				cartId_designId: {
					cartId: cart.id,
					designId,
				},
			},
		});

		return { order };
	});

	await deleteOrder(data?.order?.id);

	return null;
}

export async function getActiveCartAndProducts() {
	const userId = await getUserId();

	const cart = await db.cart.findFirst({
		where: {
			userId,
			status: CartStatus.ACTIVE,
		},
	});

	if (!cart) {
		return {
			userId,
			cart: null,
			products: [],
		};
	}

	const products = await db.cartProduct.findMany({
		where: {
			AND: [
				{
					cartId: cart.id,
				},
				{
					design: {
						isDraft: false,
					},
				},
			],
		},
		include: {
			design: {
				select: {
					id: true,
					name: true,
					price: true,
					thumbnailFileStorageKey: true,
					originalFileType: true,
					metadata: true,
				},
			},
		},
	});

	return {
		userId,
		cart,
		products: products.map((product) => ({
			...product,
			design: {
				...product.design,
				fileDPI: (product.design.metadata as FileMetadata).fileDPI,
			},
		})),
	};
}

export type ActiveCartAndProducts = Awaited<
	ReturnType<typeof getActiveCartAndProducts>
>;

export async function addItemsAction(designIds: string[]) {
	const userId = await getUserId();

	const data = await db.$transaction(async (tx) => {
		// 1. check if there is a cart for the user, if not create one
		const _cart = await tx.cart.findFirst({
			where: {
				userId,
				status: CartStatus.ACTIVE,
			},
		});

		const cart = !_cart
			? await tx.cart.create({
					data: {
						userId,
					},
				})
			: _cart;

		// get order if it exists
		const order = await tx.order.findFirst({
			where: {
				cartId: cart.id,
			},
		});

		// Create all cart products in a single transaction
		await tx.cartProduct.createMany({
			data: designIds.map((designId) => ({
				cartId: cart.id,
				designId,
			})),
			skipDuplicates: true, // Skips records that would cause unique constraint violations
		});

		return { order };
	});

	await deleteOrder(data.order?.id);

	return null;
}

export async function removeItemsAction(designIds: string[]) {
	const userId = await getUserId();

	const data = await db.$transaction(async (tx) => {
		const cart = await tx.cart.findFirst({
			where: {
				userId,
				status: CartStatus.ACTIVE,
			},
		});

		if (!cart) return;

		// get order if it exists
		const order = await tx.order.findFirst({
			where: {
				cartId: cart.id,
			},
		});

		// Delete multiple cart products in a single transaction
		await tx.cartProduct.deleteMany({
			where: {
				cartId: cart.id,
				designId: {
					in: designIds,
				},
			},
		});

		return { order };
	});

	await deleteOrder(data?.order?.id);

	return null;
}
