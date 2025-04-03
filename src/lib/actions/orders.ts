"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/utils";

export async function getCurrentUserOrders(args: {
	pagination?: { page?: number; limit?: number };
}) {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	const {
		pagination: { page = 1, limit = 12 } = {},
	} = args;

	const skip = (page - 1) * limit;

	const [orders, total] = await Promise.all([
		db.order.findMany({
			where: {
				userId: user.id,
			},
			include: {
				cart: {
					include: {
						products: {
							include: {
								design: {
									select: {
										id: true,
										thumbnailFileStorageKey: true,
										price: true,
										vendorId: true,
									},
								},
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			skip,
			take: limit,
		}),
		db.order.count({
			where: {
				userId: user.id,
			},
		}),
	]);

	const totalPages = Math.ceil(total / limit);
	const hasNextPage = page < totalPages;
	const hasPreviousPage = page > 1;

	return {
		orders,
		pagination: {
			total,
			currentPage: page,
			totalPages,
			hasNextPage,
			hasPreviousPage,
		},
	};
}

export type CurrentUserOrders = Awaited<
	ReturnType<typeof getCurrentUserOrders>
>;

export type CurrentUserOrdersProducts =
	CurrentUserOrders["orders"][number]["cart"]["products"];
