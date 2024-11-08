import type { AxiosError } from "axios";
import { NextResponse } from "next/server";
import { Cashfree } from "cashfree-pg";
import type {
	CreateVendorRequest,
	KycDetails,
	UpdateVendorRequest,
	UpiDetails,
} from "cashfree-pg";
import { z } from "zod";
import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment =
	process.env.NODE_ENV === "production"
		? Cashfree.Environment.PRODUCTION
		: Cashfree.Environment.SANDBOX;

interface VendorRequest
	extends Omit<CreateVendorRequest, "upi" | "kyc_details"> {
	upi: UpiDetails;
	kyc_details: KycDetails;
}

const createVendorValidator = z.object({
	id: z.number().optional(),
	name: z.string(),
	phone: z.string(),
	upi: z.object({
		vpa: z.string(),
		accountHolder: z.string(),
	}),
});

// Function to create vendor, UPI, and KYC within a single transaction
async function createVendorWithDetails(vendorData: {
	userId: string;
	name: string;
	status: string;
	phone: string;
	upi: { vpa: string; accountHolder: string };
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
					name: vendorData.name,
					status: vendorData.status,
					phone: vendorData.phone,
				},
			});

			// Create the UPI associated with the Vendor
			const upi = await tx.uPI.create({
				data: {
					vpa: vendorData.upi.vpa,
					accountHolder: vendorData.upi.accountHolder,
					vendorId: vendor.id,
				},
			});

			// Optionally, return all created records
			return { user, vendor, upi };
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
	const vendorData: VendorRequest = {
		vendor_id: "test1",
		status: "ACTIVE",
		name: "Darshini Jariwala",
		email: "priteshkadiwala@gmail.com",
		phone: "9825618169",
		upi: {
			vpa: "darshinijariwala1816@oksbi",
			account_holder: "Darshini Sanjaykumar Jariwala",
		},
		verify_account: false,
		dashboard_access: false,
		schedule_option: 2, // Every second day at 11:00 AM
		kyc_details: {
			business_type: "Digital Goods",
			pan: "BFEPJ3893N",
		},
	};

	try {
		await Cashfree.PGESCreateVendors(
			"2023-08-01",
			undefined,
			undefined,
			vendorData as CreateVendorRequest,
		);

		return NextResponse.json({ data: "success" });
	} catch (error: unknown) {
		if (error instanceof Error) {
			const err = error as AxiosError;

			if (err.response) {
				return NextResponse.json(err.response.data, {
					status: err.response.status ? err.response.status : 500,
				});
			}

			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(
			{ error: "An unknown error occurred" },
			{ status: 500 },
		);
	}
}

interface LocalUpdateVendorRequest
	extends Omit<UpdateVendorRequest, "upi" | "kyc_details"> {
	upi: UpiDetails;
	kyc_details: KycDetails;
}

const updateVendorValidator = z.object({
	vendorId: z.number(),
	name: z.string(),
	phone: z.string(),
	upi: z.object({
		vpa: z.string(),
		accountHolder: z.string(),
	}),
});

// Function to create vendor, UPI, and KYC within a single transaction
async function updateVendorWithDetails(vendorData: {
	userId: string;
	vendorId: number;
	name: string;
	status: string;
	phone: string;
	upi: { vpa: string; accountHolder: string };
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
			const vendor = await tx.vendor.update({
				where: {
					id: vendorData.vendorId,
				},
				data: {
					name: vendorData.name,
					status: vendorData.status,
					phone: vendorData.phone,
				},
			});

			// Create the UPI associated with the Vendor
			const upi = await tx.uPI.update({
				where: {
					vendorId: vendor.id,
				},
				data: {
					vpa: vendorData.upi.vpa,
					accountHolder: vendorData.upi.accountHolder,
					vendorId: vendor.id,
				},
			});

			// Optionally, return all created records
			return { user, vendor, upi };
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

export async function PUT(request: Request) {
	const vendorData: LocalUpdateVendorRequest = {
		status: "ACTIVE",
		name: "test 14",
		email: "",
		phone: "8123456789",
		upi: {
			vpa: "priteshkadiwala@okicici",
			account_holder: "Pritesh Kadiwala",
		},
		verify_account: false,
		dashboard_access: false,
		schedule_option: 2, // Every second day at 11:00 AM
		kyc_details: {
			business_type: "Digital Goods",
			pan: "DTPPK7970G",
		},
	};

	try {
		await Cashfree.PGESUpdateVendors(
			"2023-08-01",
			"test3",
			undefined,
			undefined,
			vendorData as UpdateVendorRequest,
		);

		return NextResponse.json({ data: "success" });
	} catch (error: unknown) {
		if (error instanceof Error) {
			const err = error as AxiosError;

			if (err.response) {
				return NextResponse.json(err.response.data, {
					status: err.response.status ? err.response.status : 500,
				});
			}

			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(
			{ error: "An unknown error occurred" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		const result = await Cashfree.PGESFetchVendors("2023-08-01", "1");

		return NextResponse.json({ data: result.data });
	} catch (error: unknown) {
		if (error instanceof Error) {
			const err = error as AxiosError;

			if (err.response) {
				return NextResponse.json(err.response.data, {
					status: err.response.status ? err.response.status : 500,
				});
			}

			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(
			{ error: "An unknown error occurred" },
			{ status: 500 },
		);
	}
}
