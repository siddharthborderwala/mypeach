"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db, PrismaError } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/utils";
import { formatFlattenedErrors } from "../utils";

const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

const createVendorSchema = z.object({
	name: z.string().trim().min(3, "Name must have at least 3 letters"),
	phone: z.string().trim().regex(phoneRegex, "Invalid phone number"),
});

export async function createVendorAction(data: {
	name: string;
	phone: string;
}) {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/login");
	}

	const result = createVendorSchema.safeParse(data);

	if (!result.success) {
		throw new Error(formatFlattenedErrors(result.error.flatten()));
	}

	try {
		const vendor = await db.vendor.create({
			data: {
				userId: user.id,
				name: result.data.name,
				phone: result.data.phone,
				status: "PENDING",
			},
			select: {
				id: true,
				name: true,
			},
		});

		return vendor;
	} catch (error) {
		if (error instanceof PrismaError) {
			if (error.code === "P2002") {
				if (typeof error.meta?.target === "string") {
					if (error.meta.target.includes("phone")) {
						throw new Error("Vendor with this phone number already exists");
					}
					if (error.meta.target.includes("name")) {
						throw new Error("Vendor with this name already exists");
					}
				}
			}
		}
		throw new Error("Failed to create vendor");
	}
}

const createKYCSchema = z.object({
	panNumber: z
		.string()
		.trim()
		.regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number"),
});

export async function createKYCAction(data: { panNumber: string }) {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/login");
	}

	const result = createKYCSchema.safeParse(data);

	if (!result.success) {
		throw new Error(formatFlattenedErrors(result.error.flatten()));
	}

	try {
		const txResult = await db.$transaction(async (tx) => {
			const vendor = await tx.vendor.findFirst({
				where: { userId: user.id },
			});
			if (!vendor) {
				throw new Error("Vendor not found");
			}

			const kyc = await tx.kYC.create({
				data: {
					pan: result.data.panNumber,
					vendorId: vendor.id,
				},
			});

			return kyc;
		});

		return txResult;
	} catch (error) {
		throw new Error("Failed to create KYC");
	}
}

const createUPISchema = z.object({
	upiId: z
		.string()
		.trim()
		.regex(/^[a-zA-Z0-9.-]{2,256}@[a-zA-Z][a-zA-Z]{2,64}$/, "Invalid UPI ID"),
	accountHolderName: z
		.string()
		.trim()
		.min(3, "Account holder name must have at least 3 letters"),
});

export async function createUPIAction(data: {
	upiId: string;
	accountHolderName: string;
}) {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/login");
	}

	const result = createUPISchema.safeParse(data);

	if (!result.success) {
		throw new Error(formatFlattenedErrors(result.error.flatten()));
	}

	try {
		const txResult = await db.$transaction(async (tx) => {
			const vendor = await tx.vendor.findFirst({
				where: { userId: user.id },
			});

			if (!vendor) {
				throw new Error("Please create your vendor profile to add UPI details");
			}

			const existingKYC = await tx.kYC.findFirst({
				where: { vendorId: vendor.id },
			});

			if (!existingKYC) {
				throw new Error("Please complete your KYC to add UPI details");
			}

			const existingUPI = await tx.uPI.findFirst({
				where: { vpa: result.data.upiId },
			});

			if (existingUPI) {
				throw new Error("UPI ID already exists");
			}

			const upi = await tx.uPI.create({
				data: {
					vpa: result.data.upiId,
					accountHolder: result.data.accountHolderName,
					vendorId: vendor.id,
				},
			});

			return upi;
		});

		return txResult;
	} catch (error) {
		throw new Error("Failed to create UPI");
	}
}

export async function updateVendorAction(data: {
	id: number;
	name: string;
	phone: string;
}) {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/login");
	}

	const result = createVendorSchema.safeParse(data);

	if (!result.success) {
		throw new Error(formatFlattenedErrors(result.error.flatten()));
	}

	try {
		const vendor = await db.vendor.update({
			where: {
				id: data.id,
				userId: user.id,
			},
			data: {
				name: result.data.name,
				phone: result.data.phone,
			},
			select: {
				id: true,
				name: true,
			},
		});

		return vendor;
	} catch (error) {
		if (error instanceof PrismaError) {
			if (error.code === "P2002") {
				if (typeof error.meta?.target === "string") {
					if (error.meta.target.includes("phone")) {
						throw new Error("Vendor with this phone number already exists");
					}
					if (error.meta.target.includes("name")) {
						throw new Error("Vendor with this name already exists");
					}
				}
			} else if (error.code === "P2025") {
				throw new Error("Vendor not found");
			}
		}
		throw new Error("Failed to update vendor");
	}
}

export async function updateKYCAction(data: {
	id: number;
	panNumber: string;
}) {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/login");
	}

	const result = createKYCSchema.safeParse({ panNumber: data.panNumber });

	if (!result.success) {
		throw new Error(formatFlattenedErrors(result.error.flatten()));
	}

	try {
		const txResult = await db.$transaction(async (tx) => {
			const vendor = await tx.vendor.findFirst({
				where: { userId: user.id },
			});

			if (!vendor) {
				throw new Error("Vendor not found");
			}

			const kyc = await tx.kYC.update({
				where: {
					id: data.id,
					vendorId: vendor.id,
				},
				data: {
					pan: result.data.panNumber,
				},
			});

			return kyc;
		});

		return txResult;
	} catch (error) {
		if (error instanceof PrismaError && error.code === "P2025") {
			throw new Error("KYC record not found");
		}
		throw new Error("Failed to update KYC");
	}
}

export async function updateUPIAction(data: {
	id: number;
	upiId: string;
	accountHolderName: string;
}) {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/login");
	}

	const result = createUPISchema.safeParse({
		upiId: data.upiId,
		accountHolderName: data.accountHolderName,
	});

	if (!result.success) {
		throw new Error(formatFlattenedErrors(result.error.flatten()));
	}

	try {
		const txResult = await db.$transaction(async (tx) => {
			const vendor = await tx.vendor.findFirst({
				where: { userId: user.id },
			});

			if (!vendor) {
				throw new Error("Vendor not found");
			}

			const existingUPI = await tx.uPI.findFirst({
				where: {
					vpa: result.data.upiId,
					NOT: { id: data.id },
				},
			});

			if (existingUPI) {
				throw new Error("UPI ID already exists");
			}

			const upi = await tx.uPI.update({
				where: {
					id: data.id,
					vendorId: vendor.id,
				},
				data: {
					vpa: result.data.upiId,
					accountHolder: result.data.accountHolderName,
				},
			});

			return upi;
		});

		return txResult;
	} catch (error) {
		if (error instanceof PrismaError && error.code === "P2025") {
			throw new Error("UPI record not found");
		}
		throw new Error("Failed to update UPI");
	}
}
