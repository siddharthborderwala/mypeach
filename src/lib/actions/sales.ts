"use server";

import { db, TxError } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/utils";

// export async function getCurrentUserSales(args: {
// 	search?: string;
// 	pagination?: { page?: number; limit?: number };
// }) {
// 	const user = await getCurrentUser();

// 	const {
// 		search,
// 		pagination: { page = 1, limit = 12 } = {},
// 	} = args;

// 	try {
// 		const result = await db.$transaction(async (tx) => {
// 			const vendor = await tx.vendor.findUnique({
// 				where: { userId: user.id },
// 				select: { id: true },
// 			});

// 			if (!vendor) {
// 				throw new TxError("Vendor not found for this user");
// 			}

// 			const skip = (page - 1) * limit;

// 			const [sales, totalCount] = await Promise.all([
// 				tx.design.findMany({
// 					where: {
// 						vendorId: vendor.id,
// 						cartProducts: {
// 							some: {
// 								cart: {
// 									order: {
// 										status: "PAID",
// 									},
// 								},
// 							},
// 						},
// 					},
// 					include: {
// 						cartProducts: {
// 							include: {
// 								cart: {
// 									include: {
// 										order: {
// 											select: {
// 												id: true,
// 												createdAt: true,
// 												amount: true,
// 												status: true,
// 											},
// 										},
// 									},
// 								},
// 							},
// 						},
// 					},
// 					orderBy: {
// 						createdAt: "desc",
// 					},
// 					skip,
// 					take: limit,
// 				}),
// 				tx.design.count({
// 					where: {
// 						vendorId: vendor.id,
// 						cartProducts: {
// 							some: {
// 								cart: {
// 									order: {
// 										status: "PAID",
// 									},
// 								},
// 							},
// 						},
// 					},
// 				}),
// 			]);

// 			const totalPages = Math.ceil(totalCount / limit);

// 			return {
// 				sales,
// 				pagination: {
// 					currentPage: page,
// 					totalPages,
// 					totalItems: totalCount,
// 					itemsPerPage: limit,
// 				},
// 			};
// 		});

// 		return result;
// 	} catch (error) {
// 		if (error instanceof TxError) {
// 			throw new Error(error.message);
// 		}

// 		throw new Error("Failed to fetch sales");
// 	}
// }

export async function getCurrentUserSales(args?: {
	search?: string;
	pagination?: { page?: number; limit?: number };
}) {
	await new Promise((resolve) => setTimeout(resolve, 500));

	return {
		sales: [
			{
				id: "design1",
				name: "Floral Pattern #1",
				thumbnailFileStorageKey: "designs/thumbnails/floral-1.webp",
				cartProducts: [
					{
						cart: {
							order: {
								id: 1001,
								createdAt: "2024-03-15T10:30:00Z",
								amount: 290,
								status: "PAID",
							},
						},
					},
				],
			},
			{
				id: "design2",
				name: "Abstract Waves",
				thumbnailFileStorageKey: "designs/thumbnails/waves.webp",
				cartProducts: [
					{
						cart: {
							order: {
								id: 1002,
								createdAt: "2024-03-14T15:45:00Z",
								amount: 350,
								status: "PAID",
							},
						},
					},
				],
			},
			{
				id: "design3",
				name: "Geometric Shapes",
				thumbnailFileStorageKey: "designs/thumbnails/geometric.webp",
				cartProducts: [
					{
						cart: {
							order: {
								id: 1003,
								createdAt: "2024-03-13T09:20:00Z",
								amount: 250,
								status: "PAID",
							},
						},
					},
				],
			},
			{
				id: "design4",
				name: "Vintage Flowers",
				thumbnailFileStorageKey: "designs/thumbnails/vintage.webp",
				cartProducts: [
					{
						cart: {
							order: {
								id: 1004,
								createdAt: "2024-03-12T14:15:00Z",
								amount: 420,
								status: "PAID",
							},
						},
					},
				],
			},
			{
				id: "design5",
				name: "Modern Lines",
				thumbnailFileStorageKey: "designs/thumbnails/modern.webp",
				cartProducts: [
					{
						cart: {
							order: {
								id: 1005,
								createdAt: "2024-03-11T11:30:00Z",
								amount: 310,
								status: "PAID",
							},
						},
					},
				],
			},
			{
				id: "design6",
				name: "Botanical Print",
				thumbnailFileStorageKey: "designs/thumbnails/botanical.webp",
				cartProducts: [
					{
						cart: {
							order: {
								id: 1006,
								createdAt: "2024-03-10T16:45:00Z",
								amount: 280,
								status: "PAID",
							},
						},
					},
				],
			},
			{
				id: "design7",
				name: "Mandala Art",
				thumbnailFileStorageKey: "designs/thumbnails/mandala.webp",
				cartProducts: [
					{
						cart: {
							order: {
								id: 1007,
								createdAt: "2024-03-09T13:20:00Z",
								amount: 380,
								status: "PAID",
							},
						},
					},
				],
			},
			{
				id: "design8",
				name: "Watercolor Splash",
				thumbnailFileStorageKey: "designs/thumbnails/watercolor.webp",
				cartProducts: [
					{
						cart: {
							order: {
								id: 1008,
								createdAt: "2024-03-08T10:15:00Z",
								amount: 330,
								status: "PAID",
							},
						},
					},
				],
			},
			{
				id: "design9",
				name: "Minimalist Pattern",
				thumbnailFileStorageKey: "designs/thumbnails/minimalist.webp",
				cartProducts: [
					{
						cart: {
							order: {
								id: 1009,
								createdAt: "2024-03-07T15:30:00Z",
								amount: 260,
								status: "PAID",
							},
						},
					},
				],
			},
			{
				id: "design10",
				name: "Tropical Leaves",
				thumbnailFileStorageKey: "designs/thumbnails/tropical.webp",
				cartProducts: [
					{
						cart: {
							order: {
								id: 1010,
								createdAt: "2024-03-06T12:45:00Z",
								amount: 390,
								status: "PAID",
							},
						},
					},
				],
			},
		],
		pagination: {
			currentPage: 1,
			totalPages: 1,
			totalItems: 10,
			itemsPerPage: 12,
		},
	};
}
