"use server";

import type { Prisma } from "@prisma/client";
import { db, TxError } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/utils";

export async function getCurrentUserSales(args: {
	search?: string;
	pagination?: { page?: number; limit?: number };
}) {
	const user = await getCurrentUser();

	const {
		search,
		pagination: { page = 1, limit = 12 } = {},
	} = args;

	try {
		const result = await db.$transaction(async (tx) => {
			const vendor = await tx.vendor.findUnique({
				where: { userId: user.id },
				select: { id: true },
			});

			if (!vendor) {
				throw new TxError("Vendor not found");
			}

			const skip = (page - 1) * limit;

			const isSearchNumber = search
				? !Number.isNaN(Number.parseInt(search))
				: false;

			const where: Prisma.SalesWhereInput = {
				vendorId: vendor.id,
				OR: search
					? [
							{
								design: {
									name: {
										contains: search,
										mode: "insensitive",
									},
								},
							},
							{
								id: isSearchNumber
									? {
											equals: Number.parseInt(search!),
										}
									: undefined,
							},
						]
					: undefined,
			};

			const [sales, totalCount, designCount] = await Promise.all([
				tx.sales.findMany({
					where,
					include: {
						design: {
							select: {
								id: true,
								name: true,
								thumbnailFileStorageKey: true,
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
					skip,
					take: limit,
				}),
				tx.sales.count({
					where,
				}),
				tx.design.count({
					where: {
						vendorId: vendor.id,
						isDraft: false,
					},
				}),
			]);

			const totalPages = Math.ceil(totalCount / limit);

			return {
				sales,
				designCount,
				pagination: {
					currentPage: page,
					totalPages,
					totalItems: totalCount,
					itemsPerPage: limit,
				},
			};
		});

		return result;
	} catch (error) {
		if (error instanceof TxError) {
			throw new Error(error.message);
		}

		throw new Error("Failed to fetch sales");
	}
}
