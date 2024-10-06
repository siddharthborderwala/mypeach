"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getUserAuth } from "../auth/utils";
import type { Prettify } from "../type-utils";

export async function getCurrentUserDesigns(page = 1, pageSize = 24) {
	const { session } = await getUserAuth();

	if (!session) {
		redirect("/login");
	}

	const skip = (page - 1) * pageSize;

	const [designs, totalCount] = await Promise.all([
		db.design.findMany({
			where: {
				userId: session.user.id,
			},
			orderBy: {
				createdAt: "desc",
			},
			skip,
			take: pageSize,
		}),
		db.design.count({
			where: {
				userId: session.user.id,
			},
		}),
	]);

	return {
		designs,
		pagination: {
			currentPage: page,
			pageSize,
			totalCount,
			totalPages: Math.ceil(totalCount / pageSize),
		},
	};
}

export type FileMetadata = {
	fileDPI: number;
};

export type DesignData = Prettify<
	Awaited<ReturnType<typeof getCurrentUserDesigns>>["designs"][number] & {
		metadata: FileMetadata;
	}
>;
