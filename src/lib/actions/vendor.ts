"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { AxiosError } from "axios";
import type { BankAccount, KYC, User, Vendor } from "@prisma/client";
import { db, PrismaError } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/utils";
import { formatFlattenedErrors } from "../utils";
import { ok, err, type Result } from "@/lib/result";
import Cashfree from "@/lib/payments/cashfree";
import type { BankDetails, CreateVendorRequest, KycDetails } from "cashfree-pg";
import type { Maybe } from "../type-utils";

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

const UNIQUE_CONSTRAINT_ERRORS = {
	userId: "You already have a vendor profile",
	accountNumber:
		"Someone else has registered with this bank account, please use a different bank account",
	pan: "Someone else has registered with this PAN, please use a different PAN",
	phone:
		"A vendor with this phone number already exists, please use a different phone number",
} as const;

function handleUniqueConstraintError(message: Maybe<string>) {
	const errorField = Object.keys(UNIQUE_CONSTRAINT_ERRORS).find((key) =>
		message?.includes(key),
	);

	if (errorField) {
		return UNIQUE_CONSTRAINT_ERRORS[
			errorField as keyof typeof UNIQUE_CONSTRAINT_ERRORS
		];
	}

	return null;
}

const createVendorWithCashfreeSchema = z.object({
	phone: z.string(),
	bankAccount: z.object({
		accountNumber: z.string(),
		accountHolder: z.string(),
		ifsc: z.string(),
	}),
	kyc: z.object({
		pan: z.string(),
	}),
});

interface VendorRequest
	extends Omit<CreateVendorRequest, "bank" | "kyc_details"> {
	bank: BankDetails;
	kyc_details: KycDetails;
}

export async function createVendorWithCashfreeAction(
	data: z.infer<typeof createVendorWithCashfreeSchema>,
) {
	const currentUser = await getCurrentUser();

	const result = createVendorWithCashfreeSchema.safeParse(data);
	if (!result.success) {
		return err(formatFlattenedErrors(result.error.flatten()), 400);
	}

	let dbVendorData: {
		user: User;
		vendor: Vendor;
		bankAccount: BankAccount;
		kyc: KYC;
	};

	try {
		const txResult = await db.$transaction(async (tx) => {
			// Get the user
			const user = await tx.user.findUnique({
				where: {
					id: currentUser.id,
				},
			});

			// If the user is not found, throw an error
			if (!user) {
				throw new Error("User not found");
			}

			// Create the Vendor
			const vendor = await tx.vendor.create({
				data: {
					userId: currentUser.id,
					status: "IN_BENE_CREATION",
					name: result.data.bankAccount.accountHolder,
					phone: result.data.phone,
				},
			});

			// Create the bank Account associated with the Vendor
			const bankAccount = await tx.bankAccount.create({
				data: {
					accountNumber: result.data.bankAccount.accountNumber,
					accountHolder: result.data.bankAccount.accountHolder,
					IFSC: result.data.bankAccount.ifsc,
					vendorId: vendor.id,
				},
			});

			// Create the KYC associated with the Vendor
			const kyc = await tx.kYC.create({
				data: {
					pan: result.data.kyc.pan,
					vendorId: vendor.id,
				},
			});

			// Optionally, return all created records
			return { user, vendor, bankAccount, kyc };
		});

		dbVendorData = txResult;
	} catch (error) {
		if (error instanceof PrismaError && error.code === "P2002") {
			const errorMessage = handleUniqueConstraintError(error.message);
			if (errorMessage) {
				return err(errorMessage, 409);
			}
		}
		return err("Sorry, we could not process your request", 500);
	}

	try {
		const vendorData: VendorRequest = {
			vendor_id: dbVendorData.vendor.id.toString(),
			status: "ACTIVE",
			email: dbVendorData.user.email,
			name: dbVendorData.vendor.name,
			phone: dbVendorData.vendor.phone,
			bank: {
				account_number: dbVendorData.bankAccount.accountNumber,
				ifsc: dbVendorData.bankAccount.IFSC,
				account_holder: dbVendorData.bankAccount.accountHolder,
			},
			verify_account: false,
			dashboard_access: false,
			schedule_option: 2, // Every second day at 11:00 AM
			kyc_details: {
				business_type: "Digital Goods",
				pan: dbVendorData.kyc.pan,
			},
		};

		await Cashfree.PGESCreateVendors(
			"2023-08-01",
			undefined,
			undefined,
			vendorData as CreateVendorRequest,
		);
	} catch (error) {
		await db.vendor.delete({
			where: { id: dbVendorData.vendor.id },
		});

		console.log("Cashfree vendor registration error", error);

		if (error instanceof AxiosError && error.response) {
			return err(
				"Sorry, our banking partner could not register your account",
				error.response.status,
			);
		}
		return err("Sorry, we could not process your request", 500);
	}

	return ok({ id: dbVendorData.vendor.id });
}
