"use server";

import { redirect } from "next/navigation";
import { getActiveCartAndProducts } from "./cart";
import { setFlashMessage } from "../utils.server";
import { validateRequest } from "../auth/lucia";
import { isAuthSession } from "../auth/client-server-utils";

export async function checkoutAction() {
	const auth = await validateRequest();
	if (!isAuthSession(auth)) {
		setFlashMessage("Please login to place an order", "error");
		redirect(`/login?redirectTo=${encodeURIComponent("/checkout")}`);
	}

	const cart = await getActiveCartAndProducts();

	if (!cart.products.length) {
		setFlashMessage(
			"Please add products to your cart to place an order",
			"error",
		);
		redirect("/");
	}

	return;
}
