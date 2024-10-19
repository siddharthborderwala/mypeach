"use server";

import { db } from "@/lib/db";
import { getUserId } from "../auth/utils";
import type { FileMetadata } from "./designs";

export async function addToCart(designId: string) {
	const userId = await getUserId();

	await db.$transaction(async (tx) => {
		// 1. check if there is a cart for the user, if not create one
		const _cart = await tx.cart.findFirst({
			where: {
				userId,
			},
		});

		const cart = !_cart
			? await tx.cart.create({
					data: {
						userId,
					},
				})
			: _cart;

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
	});
}

export async function removeFromCart(designId: string) {
	const userId = await getUserId();

	await db.$transaction(async (tx) => {
		const cart = await tx.cart.findFirst({
			where: {
				userId,
			},
		});

		if (!cart) return;

		await tx.cartProduct.delete({
			where: {
				cartId_designId: {
					cartId: cart.id,
					designId,
				},
			},
		});
	});
}

export async function getCartAndProducts() {
	const userId = await getUserId();

	const cart = await db.cart.findFirst({
		where: {
			userId,
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

export type CartAndProducts = Awaited<ReturnType<typeof getCartAndProducts>>;
