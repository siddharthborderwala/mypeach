import { z } from "zod";

export const authenticationSchema = z.object({
	email: z.string().email().min(5).max(64),
	password: z
		.string()
		.min(8, { message: "must be at least 8 characters long" }),
});

export const updateUserSchema = z.object({
	name: z.string().min(3).optional(),
	email: z.string().min(4).optional(),
});

export type UsernameAndPassword = z.infer<typeof authenticationSchema>;
