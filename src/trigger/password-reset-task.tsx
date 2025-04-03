import React from "react";
import { task, retry, logger } from "@trigger.dev/sdk/v3";
import PasswordResetEmail from "./emails/reset-password";
import { resend } from "./util/resend";

export const passwordResetTask = task({
	id: "password-reset",
	run: async (payload: {
		userId: string;
		email: string;
		token: string;
	}) => {
		logger.info("Sending password reset email", { payload });

		await retry.onThrow(
			async () => {
				const { data, error } = await resend.emails.send({
					from: "Peach <no-reply@mypeach.in>",
					to: payload.email,
					subject: "Reset your password for Peach",
					react: <PasswordResetEmail.react token={payload.token} />,
					text: PasswordResetEmail.text({ token: payload.token }),
				});

				if (error) {
					throw error;
				}

				return data;
			},
			{ maxAttempts: 3 },
		);
	},
});
