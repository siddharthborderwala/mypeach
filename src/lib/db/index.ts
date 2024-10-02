import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

declare global {
	// allow global `var` declarations
	// eslint-disable-next-line no-var
	var db: PrismaClient | undefined;
}

// biome-ignore lint/suspicious/noRedeclare: it's fine
export const db =
	global.db ||
	new PrismaClient({
		log: ["query"],
	});

if (process.env.NODE_ENV !== "production") global.db = db;

export { PrismaClientKnownRequestError as PrismaError };
