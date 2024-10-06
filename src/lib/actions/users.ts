"use server";

import { redirect } from "next/navigation";

import { db, PrismaError } from "@/lib/db/index";

import { Argon2id } from "oslo/password";
import { generateId } from "lucia";
import { z } from "zod";

import { lucia, validateRequest } from "../auth/lucia";
import {
	genericError,
	setAuthCookie,
	validateAuthFormData,
} from "../auth/utils";

import { generateUsername } from "../username";
import { emailVerificationTask } from "@/trigger/email-verification";
import { getSafeRedirect } from "../utils";
import { passwordResetTask } from "@/trigger/password-reset-task";
import { generateToken } from "../tokens";
import { sha256Digest } from "../crypto";
import { verifyPasswordResetTokenAndGetUserId } from "../auth/verification";
import { redirectWithFlash } from "../utils.server";
import { updateBasicUserDetailsSchema, updatePasswordSchema } from "./schema";

interface ActionResult {
	error: string;
}

export async function signInAction(
	_: ActionResult,
	formData: FormData,
): Promise<ActionResult> {
	const { data, error } = validateAuthFormData(formData);
	if (error !== null) return { error };

	const redirectTo = getSafeRedirect(formData);

	try {
		const existingUser = await db.user.findUnique({
			where: { email: data.email.toLowerCase() },
		});
		if (!existingUser) {
			return {
				error: "Incorrect username or password",
			};
		}

		const validPassword = await new Argon2id().verify(
			existingUser.hashedPassword,
			data.password,
		);
		if (!validPassword) {
			return {
				error: "Incorrect username or password",
			};
		}

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		setAuthCookie(sessionCookie);

		return redirect(redirectTo);
	} catch (e) {
		return genericError;
	}
}

export async function signUpAction(
	_: ActionResult,
	formData: FormData,
): Promise<ActionResult> {
	const { data, error } = validateAuthFormData(formData);
	if (error !== null) return { error };

	const redirectTo = getSafeRedirect(formData);

	const hashedPassword = await new Argon2id().hash(data.password);
	const userId = generateId(15);

	const username: string = generateUsername();

	const { token, hashedToken } = await generateToken();

	try {
		await db.$transaction([
			db.user.create({
				data: {
					id: userId,
					email: data.email,
					username: username,
					hashedPassword,
				},
				select: {
					id: true,
				},
			}),
			db.emailVerificationToken.create({
				data: {
					userId,
					hashedToken,
					expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
				},
				select: {
					hashedToken: true,
				},
			}),
		]);

		await emailVerificationTask.trigger({
			userId,
			email: data.email,
			token,
		});
	} catch (e) {
		// if it's a prisma error, return a specific error message
		if (e instanceof PrismaError) {
			if (e.code === "P2002") {
				return { error: "You already have an account, please login" };
			}
		}
		return genericError;
	}

	const session = await lucia.createSession(userId, {});
	const sessionCookie = lucia.createSessionCookie(session.id);
	setAuthCookie(sessionCookie);
	return redirectWithFlash(
		redirectTo,
		"Please check your email for a verification link",
		"success",
	);
}

export async function signOutAction(): Promise<ActionResult> {
	const { session } = await validateRequest();
	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	await lucia.invalidateSession(session.id);

	const sessionCookie = lucia.createBlankSessionCookie();
	setAuthCookie(sessionCookie);
	redirect("/");
}

const emailValidator = z.string().email();

export async function forgotPasswordAction(
	_: ActionResult,
	formData: FormData,
): Promise<ActionResult & { success?: boolean }> {
	const email = formData.get("email");

	const result = emailValidator.safeParse(email);
	if (!result.success) {
		return { error: "Invalid email", success: false };
	}

	try {
		const user = await db.user.findUnique({
			where: { email: result.data },
		});

		if (user) {
			const { token, hashedToken } = await generateToken();

			await db.passwordResetToken.create({
				data: {
					userId: user.id,
					hashedToken,
					expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 60 minutes
				},
			});

			await passwordResetTask.trigger({
				userId: user.id,
				email: user.email,
				token,
			});
		}

		return { success: true, error: "" };
	} catch (e) {
		console.error(e);
		return genericError;
	}
}

const resetPasswordSchema = z.object({
	token: z.string(),
	password: z.string(),
	confirmPassword: z.string(),
});

export async function resetPasswordAction(
	_: ActionResult,
	formData: FormData,
): Promise<ActionResult & { success?: boolean }> {
	const token = formData.get("token");
	const password = formData.get("password");
	const confirmPassword = formData.get("confirmPassword");

	const result = resetPasswordSchema.safeParse({
		token,
		password,
		confirmPassword,
	});
	if (!result.success) {
		return { error: result.error.message, success: false };
	}

	if (result.data.password !== result.data.confirmPassword) {
		return { error: "Passwords do not match", success: false };
	}

	let isSuccess = false;

	try {
		const hashedToken = await sha256Digest(result.data.token);

		const isValidTokenOrUserId = await verifyPasswordResetTokenAndGetUserId(
			result.data.token,
		);

		if (!isValidTokenOrUserId) {
			return { error: "Invalid or expired token", success: false };
		}

		const hashedPassword = await new Argon2id().hash(result.data.password);

		await db.$transaction([
			db.user.update({
				where: { id: isValidTokenOrUserId },
				data: { hashedPassword },
			}),
			db.passwordResetToken.delete({
				where: { hashedToken },
			}),
		]);

		await lucia.invalidateUserSessions(isValidTokenOrUserId);
		isSuccess = true;
	} catch (e) {
		console.error(e);
		return genericError;
	}

	if (isSuccess) {
		redirectWithFlash(
			"/login",
			"Password reset successfully, you may login now!",
			"success",
		);
	}

	return genericError;
}

export async function getBasicUserDetails() {
	const { session } = await validateRequest();
	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	const user = await db.user.findUnique({
		where: { id: session.userId },
		select: { username: true, name: true, email: true },
	});

	if (!user) {
		return {
			error: "User not found",
		};
	}

	if (user.name === null) {
		user.name = "";
	}

	return user;
}

type ActionResultDetailed<T> = {
	fieldErrors?: T;
	error: string;
};

export async function updateBasicUserDetails(
	_: ActionResult,
	formData: FormData,
): Promise<
	ActionResultDetailed<{
		username?: string[];
		name?: string[];
		email?: string[];
	}> & { success?: boolean }
> {
	const { session } = await validateRequest();
	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	const data = {
		username: formData.get("username"),
		name: formData.get("name"),
		email: formData.get("email"),
	};

	const result = updateBasicUserDetailsSchema.safeParse(data);
	if (!result.success) {
		return {
			error: "",
			fieldErrors: result.error.flatten().fieldErrors,
		};
	}

	const { username, name, email } = result.data;

	try {
		await db.$transaction(async (tx) => {
			const user = await tx.user.findUniqueOrThrow({
				where: { id: session.userId },
			});
			if (user.email !== email) {
				await tx.user.update({
					where: { id: session.userId },
					data: { email, emailVerified: false },
				});
			}
			await tx.user.update({
				where: { id: session.userId },
				data: { username, name },
			});
		});

		return { success: true, error: "" };
	} catch (e) {
		if (e instanceof PrismaError) {
			if (e.code === "P2002") {
				if (e.message.includes("username")) {
					return {
						fieldErrors: { username: ["Username is already taken"] },
						error: "",
					};
				}
				if (e.message.includes("email")) {
					return {
						fieldErrors: { email: ["Email is already taken"] },
						error: "",
					};
				}
				return { error: "Something went wrong" };
			}
			if (e.code === "P2025") {
				return { error: "User not found" };
			}
		}
		return genericError;
	}
}

export async function updatePasswordAction(
	_: ActionResult,
	formData: FormData,
): Promise<
	ActionResultDetailed<{
		currentPassword?: string[];
		newPassword?: string[];
		confirmNewPassword?: string[];
	}> & { success?: boolean }
> {
	const { session } = await validateRequest();
	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	const data = {
		currentPassword: formData.get("currentPassword"),
		newPassword: formData.get("newPassword"),
		confirmNewPassword: formData.get("confirmNewPassword"),
	};

	const result = updatePasswordSchema.safeParse(data);
	if (!result.success) {
		return {
			error: "",
			fieldErrors: result.error.flatten().fieldErrors,
		};
	}

	const { currentPassword, newPassword, confirmNewPassword } = result.data;

	if (newPassword !== confirmNewPassword) {
		return {
			fieldErrors: { confirmNewPassword: ["Passwords do not match"] },
			error: "",
		};
	}

	try {
		const user = await db.user.findUniqueOrThrow({
			where: { id: session.userId },
		});

		const validPassword = await new Argon2id().verify(
			user.hashedPassword,
			currentPassword,
		);
		if (!validPassword) {
			return {
				fieldErrors: { currentPassword: ["Incorrect current password"] },
				error: "",
			};
		}

		const hashedNewPassword = await new Argon2id().hash(newPassword);

		await db.user.update({
			where: { id: session.userId },
			data: { hashedPassword: hashedNewPassword },
		});

		return { success: true, error: "" };
	} catch (e) {
		if (e instanceof PrismaError) {
			if (e.code === "P2025") {
				return { error: "User not found" };
			}
			return { error: "Something went wrong" };
		}
		return genericError;
	}
}

export async function deleteAccountAction(
	_: ActionResult,
	__: FormData,
): Promise<ActionResult & { success?: boolean }> {
	const { session } = await validateRequest();
	if (!session) {
		return {
			error: "Unauthorized",
		};
	}

	try {
		await db.user.delete({
			where: { id: session.userId },
		});

		await lucia.invalidateSession(session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		setAuthCookie(sessionCookie);
		redirect("/");
	} catch (e) {
		if (e instanceof PrismaError) {
			if (e.code === "P2025") {
				return { error: "User not found" };
			}
			return { error: "Something went wrong" };
		}
		return genericError;
	}
}
