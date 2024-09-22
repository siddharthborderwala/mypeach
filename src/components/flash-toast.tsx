"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function FlashToast() {
	const pathname = usePathname();

	// biome-ignore lint/correctness: we want to run this on pathname change
	useEffect(() => {
		const toastData = document.cookie
			.split("; ")
			.find((row) => row.startsWith("flash="));

		if (toastData) {
			// get message and type
			const { message, type } = JSON.parse(
				decodeURIComponent(toastData.split("=")[1]),
			);
			const toastType = type as "success" | "error" | "info" | "warning";
			toast[toastType](message, {
				duration: 5000,
			});
			document.cookie = "toast=; Max-Age=0; path=/; SameSite=strict";
		}
	}, [pathname]);

	return null;
}
