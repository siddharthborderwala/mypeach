import type { AxiosError } from "axios";
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
	phone: z.string(),
	upi: z.object({
		vpa: z.string(),
		accountHolder: z.string(),
	}),
	kyc: z.object({
		pan: z.string(),
	}),
});

// Function to create vendor, UPI, and KYC within a single transaction
async function createVendorWithDetails(vendorData: {
	userId: string;
	phone: string;
	upi: { vpa: string; accountHolder: string };
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
					name: vendorData.upi.accountHolder,
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
					pan: vendorData.kyc.pan,
					vendorId: vendor.id,
				},
			});

			// Optionally, return all created records
			return { user, vendor, upi, kyc };
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
		name: result.data.upi.accountHolder,
		phone: result.data.phone,
		upi: {
			vpa: result.data.upi.vpa,
			account_holder: result.data.upi.accountHolder,
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
			upi: {
				vpa: vendorData.upi.vpa as string,
				accountHolder: vendorData.upi.account_holder as string,
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
		// Delete the vendor if the transaction fails
		await db.vendor.delete({
			where: {
				userId: session.user.id,
			},
		});

		const err = error as AxiosError;

		if (err.response) {
			return NextResponse.json(err.response.data, {
				status: err.response.status ? err.response.status : 500,
			});
		}

		return NextResponse.json(
			{ error: (error as Error).message },
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
		},
	});

	if (!vendor) {
		return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
	}

	if (vendor.status === "IN_BENE_CREATION") {
		const result = await Cashfree.PGESFetchVendors(
			"2023-08-01",
			vendor.id.toString(),
		);

		if (result.data.status !== "IN_BENE_CREATION") {
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
	}

	return NextResponse.json({ ...vendor });
}
