import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const appBaseURL = (() => {
	if (process.env.VERCEL_GIT_COMMIT_REF === "main") {
		return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
	}
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}
	return "http://localhost:3000";
})();

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
