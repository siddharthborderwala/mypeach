"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getUserAuth } from "../auth/utils";

export async function getCurrentUserDesigns() {
	const { session } = await getUserAuth();

	if (!session) {
		redirect("/login");
	}

	const designs = await db.design.findMany({
		where: {
			userId: session.user.id,
		},
	});

	return designs;
}
