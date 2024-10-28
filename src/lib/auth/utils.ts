import { cookies } from "next/headers";

import type { Cookie } from "lucia";

import { validateRequest } from "./lucia";
import {
	type UsernameAndPassword,
	authenticationSchema,
} from "../db/schema/auth";
import { SESSION } from "../sessions";
import { redirect } from "next/navigation";
import { isAuthSession } from "./client-server-utils";

export type AuthSession = {
	session: {
		user: {
			id: string;
			username: string;
		};
	} | null;
};

/**
 * Returns the current user if authenticated, otherwise returns null session
 */
export const getUserAuth = async (): Promise<AuthSession> => {
	const auth = await validateRequest();
	if (!isAuthSession(auth)) {
		return {
			session: null,
		};
	}
	return {
		session: {
			user: {
				id: auth.user.id,
				username: auth.user.username,
			},
		},
	};
};

/**
 * Returns the current user if authenticated, otherwise redirects to login
 */
export const getCurrentUser = async () => {
	const auth = await validateRequest();
	if (!isAuthSession(auth)) {
		redirect("/login");
	}

	return {
		id: auth.user.id,
		username: auth.user.username,
	};
};

/**
 * Checks if the user is authenticated, otherwise redirects to login
 */
export const checkAuth = async () => {
	const auth = await validateRequest();
	if (!isAuthSession(auth)) {
		redirect("/login");
	}
};

export const setCookie = (cookie: Cookie) => {
	// cookies().set(cookie.name, cookie.value, cookie.attributes); // <- suggested approach from the docs, but does not work with `next build` locally
	cookies().set(cookie);
};

export const clearSessionCookie = () => {
	cookies().delete(SESSION);
};

const getErrorMessage = (errors: {
	email?: string[];
	password?: string[];
}): string => {
	if (errors.email) return "Invalid Email";
	if (errors.password) return `Invalid Password - ${errors.password[0]}`;
	return ""; // return a default error message or an empty string
};

export const validateAuthFormData = (
	formData: FormData,
):
	| { data: UsernameAndPassword; error: null }
	| { data: null; error: string } => {
	const email = formData.get("email");
	const password = formData.get("password");
	const result = authenticationSchema.safeParse({ email, password });

	if (!result.success) {
		return {
			data: null,
			error: getErrorMessage(result.error.flatten().fieldErrors),
		};
	}

	return { data: result.data, error: null };
};

/**
 * Returns the current user id if authenticated, otherwise returns the anonymous user id
 */
export const getUserId = async () => {
	const auth = await validateRequest();

	if ("anonymousUser" in auth) {
		return auth.anonymousUser.id;
	}
	if (!auth.user) {
		throw new Error("No session found");
	}
	return auth.user.id;
};
