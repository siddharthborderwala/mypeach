import { db } from "@/lib/db";
import { sha256Digest } from "../crypto";
import { z } from "zod";
import { TOKEN_LENGTH } from "../tokens";

const tokenValidator = z.string().length(TOKEN_LENGTH);

export const verifyEmailVerificationToken = async (
	token: string,
): Promise<boolean> => {
	const parsedToken = tokenValidator.safeParse(token);
	if (!parsedToken.success) {
		return false;
	}

	const hashedToken = await sha256Digest(token);

	return db.$transaction(async (tx) => {
		const result = await tx.emailVerificationToken.findUnique({
			where: {
				hashedToken,
			},
			select: {
				userId: true,
				expiresAt: true,
			},
		});

		if (!result) {
			return false;
		}

		// delete the token after upon successful query
		await tx.emailVerificationToken.delete({
			where: {
				hashedToken,
			},
		});

		if (result.expiresAt < new Date()) {
			return false;
		}

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

export const verifyPasswordResetTokenAndGetUserId = async (
	token: string,
): Promise<string | false> => {
	const parsedToken = tokenValidator.safeParse(token);
	if (!parsedToken.success) {
		return false;
	}

	const hashedToken = await sha256Digest(token);

	return db.$transaction(async (tx) => {
		const result = await tx.passwordResetToken.findUnique({
			where: {
				hashedToken,
			},
			select: {
				userId: true,
				expiresAt: true,
			},
		});

		if (!result) {
			return false;
		}

		// if not expired do not delete until the token has been used to update the password

		if (result.expiresAt < new Date()) {
			await tx.passwordResetToken.delete({
				where: {
					hashedToken,
				},
			});

			return false;
		}

		return result.userId;
	});
};
