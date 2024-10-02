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
	getUserAuth,
} from "../auth/utils";

import { generateUsername } from "../username";
import { emailVerificationTask } from "@/trigger/email-verification";
import { getSafeRedirect } from "../utils";
import { passwordResetTask } from "@/trigger/password-reset-task";
import { generateToken } from "../tokens";
import { sha256Digest } from "../crypto";
import { verifyPasswordResetTokenAndGetUserId } from "../auth/verification";
import { redirectWithFlash } from "../utils.server";

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
