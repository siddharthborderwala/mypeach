import axios from "axios";
import { load } from "@cashfreepayments/cashfree-js";

export const checkout = async ({
	cartId,
	phone,
	name,
}: {
	cartId: number;
	phone: string;
	name?: string;
}) => {
	try {
		const response = await axios.post("/api/order", {
			cartId,
			phone,
			name,
		});

		const paymentSessionId = response.data.paymentSessionId;

		const checkoutOptions = {
			paymentSessionId,
			redirectTarget: "_modal",
		};

		const cashfree = await load({
			mode: process.env.NODE_ENV === "production" ? "production" : "sandbox",
		});

		if (!cashfree) {
			throw new Error("Cashfree SDK not initialized");
		}

		const result = await cashfree.checkout(checkoutOptions);

		if (result.error) {
			// This will be true whenever user clicks on close icon inside the modal or any error happens during the payment
			console.log(
				"User has closed the popup or there is some payment error, Check for Payment Status",
			);
			console.log(result.error);
			throw new Error(
				"User has closed the popup or there is some payment error, Check for Payment Status",
			);
		}
		if (result.redirect) {
			// This will be true when the payment redirection page couldnt be opened in the same window
			// This is an exceptional case only when the page is opened inside an inAppBrowser
			// In this case the customer will be redirected to return url once payment is completed
			console.log("Payment will be redirected");
			throw new Error("Payment will be redirected");
		}
		if (result.paymentDetails) {
			// This will be called whenever the payment is completed irrespective of transaction status
			console.log("Payment has been completed, Check for Payment Status");
			return {
				success: true,
				data: {
					paymentDetails: result.paymentDetails,
					orderId: response.data.orderId,
				},
			};
		}

		throw new Error("Payment failed");
	} catch (error) {
		console.error("Error reading sheet:", error);
		throw error;
	}
};
