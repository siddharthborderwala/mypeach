import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const appBaseURL = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

const URLValidator = z.string().url();

export function getSafeRedirect(formData: FormData) {
	const redirectTo = formData.get("redirectTo") ?? undefined;
	if (typeof redirectTo !== "string") return "/";
	const result = URLValidator.safeParse(redirectTo);
	if (result.success && new URL(redirectTo).origin !== appBaseURL) {
		return "/";
	}
	return redirectTo;
}
