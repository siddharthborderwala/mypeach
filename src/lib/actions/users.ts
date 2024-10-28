"use server";

import { redirect, RedirectType } from "next/navigation";

import { db, PrismaError } from "@/lib/db/index";

import { Argon2id } from "oslo/password";
import { generateId } from "lucia";
import { z } from "zod";
import { cookies } from "next/headers";

import { lucia, validateRequest } from "../auth/lucia";
import {
	clearSessionCookie,
	setCookie,
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
import { redis } from "../redis";
import { createAnonymousSessionCookie } from "../sessions";
import { isAnonymousSession, isAuthSession } from "../auth/client-server-utils";

const genericError = { error: "Error, please try again." };

interface ActionResult {
	error: string;
}

async function migrateCart(anonUserId: string, userId: string) {
	await db.$transaction(async (tx) => {
		const anonCart = await tx.cart.findFirst({
			where: { userId: anonUserId },
		});
		if (!anonCart) return;

		// delete userId's carts
		await tx.cart.deleteMany({
			where: { userId: userId },
		});

		// create new cart for userId
		const newCart = await tx.cart.create({
			data: {
				userId: userId,
			},
		});

		// copy over products from anonCart to userId's cart
		await tx.cartProduct.updateMany({
			where: { cartId: anonCart.id },
			data: {
				cartId: newCart.id,
			},
		});

		// delete anonCart
		await tx.cart.delete({
			where: { id: anonCart.id },
		});
	});
}

export async function signInAction(
	_: ActionResult,
	formData: FormData,
): Promise<ActionResult> {
	const { data, error } = validateAuthFormData(formData);
	if (error !== null) return { error };

	const redirectTo = getSafeRedirect(formData.get("redirectTo")?.toString());

	let anonUserId: string | null = null;
	const auth = await validateRequest();
	if (isAnonymousSession(auth)) {
		anonUserId = auth.anonymousUser.id;
	}

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
		const session = await lucia.createSession(existingUser.id, {
			username: existingUser.username,
		});
		const sessionCookie = lucia.createSessionCookie(session.id);
		setCookie(sessionCookie);
		clearSessionCookie();

		if (anonUserId) {
			await migrateCart(anonUserId, existingUser.id);
		}

		redirect(redirectTo, RedirectType.push);
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

	const redirectTo = getSafeRedirect(formData.get("redirectTo")?.toString());

	let anonUserId: string | null = null;
	const auth = await validateRequest();
	if (isAnonymousSession(auth)) {
		anonUserId = auth.anonymousUser.id;
	}

	const hashedPassword = await new Argon2id().hash(data.password);
	const userId = generateId(36);

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

		if (anonUserId) {
			await migrateCart(anonUserId, userId);
		}

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

	const session = await lucia.createSession(userId, {
		username,
	});
	const sessionCookie = lucia.createSessionCookie(session.id);
	setCookie(sessionCookie);
	clearSessionCookie();

	redirectWithFlash(
		redirectTo,
		"Please check your email for a verification link",
		"success",
	);
}

export async function signOutAction(): Promise<ActionResult> {
	const auth = await validateRequest();
	if (!isAuthSession(auth)) {
		return {
			error: "Unauthorized",
		};
	}
	const session = auth.authSession;

	await lucia.invalidateSession(session.id);

	const sessionCookie = lucia.createBlankSessionCookie();
	setCookie(sessionCookie);
	clearSessionCookie();
	// clear all cookies
	for (const cookie of cookies().getAll()) {
		cookies().delete(cookie.name);
	}
	const c = createAnonymousSessionCookie();
	cookies().set(c.name, c.value, c.attributes);
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
	const auth = await validateRequest();
	if (!isAuthSession(auth)) {
		return {
			error: "Unauthorized",
		};
	}
	const session = auth.authSession;

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
	const auth = await validateRequest();
	if (!isAuthSession(auth)) {
		return {
			error: "Unauthorized",
		};
	}

	const session = auth.authSession;

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

		await redis.connect();

		await redis.set(
			`user:${session.userId}`,
			JSON.stringify({ id: session.userId, attributes: { username } }),
		);

		await redis.disconnect();

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
		console.log(e);
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
	const auth = await validateRequest();
	if (!isAuthSession(auth)) {
		return {
			error: "Unauthorized",
		};
	}
	const session = auth.authSession;

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
	const auth = await validateRequest();
	if (!isAuthSession(auth)) {
		return {
			error: "Unauthorized",
		};
	}
	const session = auth.authSession;

	try {
		await db.user.delete({
			where: { id: session.userId },
		});

		await lucia.invalidateSession(session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		setCookie(sessionCookie);
		clearSessionCookie();
		// clear all cookies
		for (const cookie of cookies().getAll()) {
			cookies().delete(cookie.name);
		}
		const c = createAnonymousSessionCookie();
		cookies().set(c.name, c.value, c.attributes);
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
