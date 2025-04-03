import { getUserAuth } from "@/lib/auth/utils";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET() {
	const { session } = await getUserAuth();
	if (!session) {
		return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
	}

	try {
		const user = await db.user.findUnique({
			where: { id: session.user.id },
			select: {
				id: true,
				name: true,
				phone: true,
				email: true,
			},
		});

		return NextResponse.json(user);
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
	}
}

const putUserSchema = z.object({
	name: z.string(),
	phone: z.string(),
});

export async function PUT(request: Request) {
	const { session } = await getUserAuth();
	if (!session) {
		return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
	}

	const data = await request.json();
	const result = putUserSchema.safeParse(data);

	if (!result.success) {
		return NextResponse.json(
			{ error: "Invalid request body" },
			{ status: 400 },
		);
	}

	try {
		const user = await db.user.update({
			where: { id: session.user.id },
			data,
		});

		return NextResponse.json(user);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 },
		);
	}
}
