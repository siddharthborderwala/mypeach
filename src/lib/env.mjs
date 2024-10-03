import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		DATABASE_URL: z.string().min(1),
		RESEND_API_KEY: z.string().min(1),
		TRIGGER_SECRET_KEY: z.string().min(1),
		R2_ACCOUNT_ID: z.string().min(1),
		R2_ACCESS_KEY_ID: z.string().min(1),
		R2_SECRET_ACCESS_KEY: z.string().min(1),
		R2_PROTECTED_BUCKET_NAME: z.string().min(1),
		R2_PUBLIC_BUCKET_NAME: z.string().min(1),
		USERCONTENT_BASE_URL: z.string().min(1),
	},
	client: {
		// NEXT_PUBLIC_PUBLISHABLE_KEY: z.string().min(1),
		NEXT_PUBLIC_R2_PROTECTED_BUCKET_NAME: z.string().min(1),
		NEXT_PUBLIC_R2_PUBLIC_BUCKET_NAME: z.string().min(1),
		NEXT_PUBLIC_USERCONTENT_BASE_URL: z.string().min(1),
	},
	// If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
	// For Next.js >= 13.4.4, you only need to destructure client variables:
	runtimeEnv: {
		NEXT_PUBLIC_R2_PROTECTED_BUCKET_NAME:
			process.env.NEXT_PUBLIC_R2_PROTECTED_BUCKET_NAME,
		NEXT_PUBLIC_R2_PUBLIC_BUCKET_NAME:
			process.env.NEXT_PUBLIC_R2_PUBLIC_BUCKET_NAME,
		NEXT_PUBLIC_USERCONTENT_BASE_URL:
			process.env.NEXT_PUBLIC_USERCONTENT_BASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		DATABASE_URL: process.env.DATABASE_URL,
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,
		R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
		R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
		R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
		R2_PROTECTED_BUCKET_NAME: process.env.R2_PROTECTED_BUCKET_NAME,
		R2_PUBLIC_BUCKET_NAME: process.env.R2_PUBLIC_BUCKET_NAME,
		USERCONTENT_BASE_URL: process.env.USERCONTENT_BASE_URL,
	},
	experimental__runtimeEnv: {
		// NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
	},
});
