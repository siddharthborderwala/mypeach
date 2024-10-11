import { NextResponse } from "next/server";
import { Cashfree } from "cashfree-pg";
import type { CreateVendorRequest, KycDetails, UpiDetails } from "cashfree-pg";
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
	name: z.string(),
	email: z.string(),
	phone: z.string(),
	upi: z.object({
		vpa: z.string(),
		accountHolder: z.string(),
	}),
	kyc_details: z.object({
		pan: z.string(),
	}),
});

// Function to create vendor, UPI, and KYC within a single transaction
async function createVendorWithDetails(vendorData: {
	userId: string;
	name: string;
	status: string;
	phone: string;
	upi: { vpa: string; accountHolder: string };
	kyc_details: { pan: string };
}) {
	try {
		const result = await db.$transaction(async (tx) => {
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

			// Create the KYC associated with the Vendor
			const kyc = await tx.kYC.create({
				data: {
					pan: vendorData.kyc_details.pan,
					vendorId: vendor.id,
				},
			});

			// Optionally, return all created records
			return { vendor, upi, kyc };
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
		name: result.data.name,
		email: result.data.email,
		phone: result.data.phone,
		upi: result.data.upi,
		verify_account: false,
		dashboard_access: false,
		schedule_option: 2, // Every second day at 11:00 AM
		kyc_details: {
			account_type: "INDIVIDUAL",
			business_type: "Digital Goods",
			pan: result.data.kyc_details.pan,
		},
	};

	try {
		const { vendor } = await createVendorWithDetails({
			userId: session.user.id,
			name: vendorData.name,
			status: vendorData.status,
			phone: vendorData.phone,
			upi: vendorData.upi as { vpa: string; accountHolder: string },
			kyc_details: vendorData.kyc_details as { pan: string },
		});

		vendorData.vendor_id = vendor.id.toString();

		await Cashfree.PGESCreateVendors(
			"2023-08-01",
			undefined,
			undefined,
			vendorData as CreateVendorRequest,
		);

		return NextResponse.json({ data: vendor });
	} catch (error: unknown) {
		if (error instanceof Error) {
			return NextResponse.json({ error: error }, { status: 500 });
		}

		return NextResponse.json(
			{ error: "An unknown error occurred" },
			{ status: 500 },
		);
	}
}
