"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "../auth/utils";
import { redirect } from "next/navigation";

export async function getVendor() {
	const user = await getCurrentUser();
	if (!user) {
		redirect("/login");
	}

	const vendor = await db.vendor.findUnique({
		where: {
			userId: user.id,
		},
		select: {
			id: true,
			KYC: {
				select: {
					id: true,
					pan: true,
				},
			},
			UPI: {
				select: {
					id: true,
					vpa: true,
					accountHolder: true,
				},
			},
			name: true,
			phone: true,
			status: true,
		},
	});

	return vendor;
}
