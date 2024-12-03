import { AxiosError } from "axios";
import { NextResponse } from "next/server";

import type { CreateVendorRequest, KycDetails, BankDetails } from "cashfree-pg";
import { z } from "zod";
import { getUserAuth } from "@/lib/auth/utils";
import { db, PrismaError } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { Maybe } from "@/lib/type-utils";
import Cashfree from "@/lib/payments/cashfree";

interface VendorRequest
	extends Omit<CreateVendorRequest, "bank" | "kyc_details"> {
	bank: BankDetails;
	kyc_details: KycDetails;
}

const createVendorValidator = z.object({
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
		return NextResponse.json(
			{
				error:
					UNIQUE_CONSTRAINT_ERRORS[
						errorField as keyof typeof UNIQUE_CONSTRAINT_ERRORS
					],
			},
			{ status: 409 },
		);
	}

	return null;
}

// Function to create vendor, UPI, and KYC within a single transaction
async function createVendorWithDetails(vendorData: {
	userId: string;
	phone: string;
	bankAccount: {
		accountNumber: string;
		ifsc: string;
		accountHolder: string;
	};
	kyc: {
		pan: string;
	};
}) {
	try {
		const result = await db.$transaction(async (tx) => {
			// Get the user
			const user = await tx.user.findUnique({
				where: {
					id: vendorData.userId,
				},
			});

			// If the user is not found, throw an error
			if (!user) {
				throw new Error("User not found");
			}

			// Create the Vendor
			const vendor = await tx.vendor.create({
				data: {
					userId: vendorData.userId,
					status: "IN_BENE_CREATION",
					name: vendorData.bankAccount.accountHolder,
					phone: vendorData.phone,
				},
			});

			// Create the bank Account associated with the Vendor
			const bankAccount = await tx.bankAccount.create({
				data: {
					accountNumber: vendorData.bankAccount.accountNumber,
					accountHolder: vendorData.bankAccount.accountHolder,
					IFSC: vendorData.bankAccount.ifsc,
					vendorId: vendor.id,
				},
			});

			// Create the KYC associated with the Vendor
			const kyc = await tx.kYC.create({
				data: {
					pan: vendorData.kyc.pan,
					vendorId: vendor.id,
				},
			});

			// Optionally, return all created records
			return { user, vendor, bankAccount, kyc };
		});

		// Handle the result as needed
		console.log("Transaction successful:", result);
		return result;
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			// Handle known Prisma errors
			console.error("Prisma error:", error.message);
		} else {
			// Handle other types of errors
			console.error("Unexpected error:", error);
		}
		throw error; // Re-throw the error after logging
	}
}

export async function POST(request: Request) {
	const { session } = await getUserAuth();
	if (!session) {
		return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
	}

	const body = await request.json();

	const result = createVendorValidator.safeParse(body);

	if (!result.success) {
		return NextResponse.json({ error: result.error.message }, { status: 400 });
	}

	const vendorData: VendorRequest = {
		vendor_id: "",
		status: "ACTIVE",
		email: "",
		name: result.data.bankAccount.accountHolder,
		phone: result.data.phone,
		bank: {
			account_number: result.data.bankAccount.accountNumber,
			ifsc: result.data.bankAccount.ifsc,
			account_holder: result.data.bankAccount.accountHolder,
		},
		verify_account: false,
		dashboard_access: false,
		schedule_option: 2, // Every second day at 11:00 AM
		kyc_details: {
			business_type: "Digital Goods",
			pan: result.data.kyc.pan,
		},
	};

	try {
		const { user, vendor } = await createVendorWithDetails({
			userId: session.user.id,
			phone: vendorData.phone,
			bankAccount: {
				accountNumber: vendorData.bank.account_number as string,
				ifsc: vendorData.bank.ifsc as string,
				accountHolder: vendorData.bank.account_holder as string,
			},
			kyc: {
				pan: vendorData.kyc_details.pan as string,
			},
		});

		vendorData.vendor_id = vendor.id.toString();
		vendorData.email = user.email;

		await Cashfree.PGESCreateVendors(
			"2023-08-01",
			undefined,
			undefined,
			vendorData as CreateVendorRequest,
		);

		return NextResponse.json({ data: vendor });
	} catch (error: unknown) {
		if (error instanceof AxiosError && error.response) {
			// Delete the vendor if the transaction fails
			await db.vendor.delete({
				where: {
					userId: session.user.id,
				},
			});

			return NextResponse.json(
				{ error: "Sorry, our banking partner could not register your account" },
				{
					status: error.response.status ? error.response.status : 500,
				},
			);
		}

		if (error instanceof PrismaError) {
			if (error.code === "P2002") {
				const response = handleUniqueConstraintError(error.message);
				if (response) return response;
			}
		}

		console.error(error);
		return NextResponse.json(
			{ error: "Sorry, we could not process your request" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	const { session } = await getUserAuth();
	if (!session) {
		return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
	}

	let vendor = await db.vendor.findFirst({
		where: {
			userId: session.user.id,
		},
		include: {
			UPI: true,
			KYC: true,
			BankAccount: true,
		},
	});

	if (!vendor) {
		return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
	}

	if (vendor.status !== "ACTIVE") {
		const result = await Cashfree.PGESFetchVendors(
			"2023-08-01",
			vendor.id.toString(),
		);

		vendor = await db.vendor.update({
			where: {
				id: vendor.id,
			},
			data: {
				status: result.data.status,
			},
			include: {
				UPI: true,
				KYC: true,
				BankAccount: true,
			},
		});

		if (result.data.status === "ACTIVE") {
			await db.design.updateMany({
				where: {
					vendorId: vendor.id,
				},
				data: {
					isDraft: false,
				},
			});
		}
	}

	return NextResponse.json({ ...vendor });
}
