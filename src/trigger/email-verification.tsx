import React from "react";
import { task, retry, logger } from "@trigger.dev/sdk/v3";
import { resend } from "@/lib/email";
import VerifyEmail from "@/components/emails/verify-email";

export const emailVerificationTask = task({
	id: "email-verification",
	run: async (payload: { userId: string; email: string; token: string }) => {
		logger.info("Sending email verification email", { payload });

		//send the first email immediately
		await retry.onThrow(
			async () => {
				const { data, error } = await resend.emails.send({
					from: "Peach <no-reply@mypeach.in>",
					to: payload.email,
					subject: "Please verify your email for Peach",
					react: <VerifyEmail.react token={payload.token} />,
					text: VerifyEmail.text({ token: payload.token }),
				});

				if (error) {
					//throwing an error will trigger a retry of this block
					throw error;
				}

				return data;
			},
			{ maxAttempts: 3 },
		);
	},
});
