import { generateId } from "lucia";
import { TimeSpan } from "oslo";
import { CookieController } from "oslo/cookie";

export const AUTH_SESSION = "auth_session";
export const SESSION = "session";

export const sessionCookieController = new CookieController(
	SESSION,
	{
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
	},
	{
		expiresIn: new TimeSpan(2, "d"),
	},
);

/**
 * Anonymous session cookie
 *
 * {
 *   sessionId: string;
 *   userId: string;
 * }
 *
 */
export const createAnonymousSessionCookie = () => {
	const sessionId = generateId(36);
	const userId = generateId(36);

	const cookieValueRaw = JSON.stringify({
		sessionId,
		userId,
	});

	const cookieValue = Buffer.from(cookieValueRaw).toString("base64");

	return sessionCookieController.createCookie(cookieValue);
};
