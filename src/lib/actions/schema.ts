import z from "zod";

export const updateBasicUserDetailsSchema = z.object({
	username: z.string().min(3, "Username must be at least 3 characters long"),
	name: z.string().optional(),
	email: z.string().email("Invalid email address"),
});

export const updatePasswordSchema = z.object({
	currentPassword: z.string(),
	newPassword: z
		.string()
		.min(8, "New password must be at least 8 characters long"),
	confirmNewPassword: z
		.string()
		.min(8, "New password must be at least 8 characters long"),
});
