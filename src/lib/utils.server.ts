import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Safely redirects to a URL and sets a flash toast message.
 */
export function redirectWithFlash(
	redirectTo: string,
	message: string,
	type: "success" | "error" | "info" | "warning",
) {
	cookies().set("flash", JSON.stringify({ message, type }), {
		httpOnly: false, // Changed to false
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 5, // The cookie will be removed after 5 seconds
		path: "/",
	});

	return redirect(redirectTo);
}
