import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export function setFlashMessage(
	message: string,
	type: "success" | "error" | "info" | "warning",
) {
	cookies().set("flash", JSON.stringify({ message, type }), {
		httpOnly: false, // needs to be accessible to the client
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 1, // The cookie will be removed after 1 second
	});
}

/**
 * Safely redirects to a URL and sets a flash toast message.
 */
export function redirectWithFlash(
	redirectTo: string,
	message: string,
	type: "success" | "error" | "info" | "warning",
): never {
	setFlashMessage(message, type);
	redirect(redirectTo);
}
