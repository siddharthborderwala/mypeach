import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const appBaseURL = (() => {
	if (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF === "main") {
		return `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`;
	}
	if (process.env.NEXT_PUBLIC_VERCEL_URL) {
		return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
	}
	return "http://localhost:3000";
})();

const URLValidator = z.string().url();

export function getSafeRedirect(target: string | undefined) {
	if (typeof target !== "string") return "/";
	const result = URLValidator.safeParse(target);
	if (result.success && new URL(target).origin !== appBaseURL) {
		return "/";
	}
	return target;
}

export function getUserAvatarURL(userId: string, size = 56) {
	return `https://avatar.vercel.sh/${userId}.svg?size=${size}`;
}

export function formatPrice(amount: number, currency = "INR") {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency,
	}).format(amount);
}

export function relativeTime(date: Date | string | number) {
	return formatDistanceToNow(new Date(date), { addSuffix: true });
}

function formatDistanceToNow(date: Date, arg1: { addSuffix: boolean }) {
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	const intervals = [
		{ label: "year", seconds: 31536000 },
		{ label: "month", seconds: 2592000 },
		{ label: "day", seconds: 86400 },
		{ label: "hour", seconds: 3600 },
		{ label: "minute", seconds: 60 },
		{ label: "second", seconds: 1 },
	];

	for (let i = 0; i < intervals.length; i++) {
		const interval = intervals[i]!;
		const count = Math.floor(diffInSeconds / interval.seconds);
		if (count >= 1) {
			const plural = count > 1 ? "s" : "";
			const distance = `${count} ${interval.label}${plural}`;
			return arg1.addSuffix ? `${distance} ago` : distance;
		}
	}

	return arg1.addSuffix ? "just now" : "0 seconds";
}

export function isMobileUA(ua: string) {
	return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
		ua,
	);
}

export function fromBase64(value: string) {
	return new TextDecoder().decode(Buffer.from(value, "base64"));
}

export function toBase64(value: string) {
	return Buffer.from(value).toString("base64");
}

export function mimeToExtension(mime: string) {
	return mime.split("/")[1];
}

export function formatFlattenedErrors<T>(errors: z.typeToFlattenedError<T>) {
	return Object.entries(errors.fieldErrors ?? {})
		.map(([, errors]) => (errors as string[])?.join(", ") ?? "")
		.join(", ");
}
