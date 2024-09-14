import { db } from "@/lib/db";

export const verifyEmailVerificationToken = async (token: string) => {
	return db.$transaction(async (tx) => {
		const result = await tx.emailVerificationToken.findUnique({
			where: {
				token,
			},
			select: {
				userId: true,
				expiresAt: true,
			},
		});

		if (!result) {
			return false;
		}

		if (result.expiresAt < new Date()) {
			return false;
		}

		await tx.emailVerificationToken.delete({
			where: {
				token,
			},
		});

		await tx.user.update({
			where: {
				id: result.userId,
			},
			data: {
				emailVerified: true,
			},
		});

		return true;
	});
};
