import { cookies } from "next/headers";
import { cache } from "react";

import { type Session, type User, Lucia } from "lucia";
import { RedisAdapter } from "./redis-adapter";
// import { db } from "@/lib/db/index";

// import { PrismaAdapter } from "@lucia-auth/adapter-prisma";

// const adapter = new PrismaAdapter(db.session, db.user);

const adapter = new RedisAdapter(process.env.REDIS_URL!);

interface DatabaseUserAttributes {
	username: string;
}

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		expires: false,
		attributes: {
			secure: process.env.NODE_ENV === "production",
		},
	},
	getUserAttributes: (user) => {
		console.log("USERRRRRR", user);

		return {
			username: user.username,
		} satisfies DatabaseUserAttributes;
	},
});

export const validateRequest = cache(
	async (): Promise<
		{ user: User; session: Session } | { user: null; session: null }
	> => {
		const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
		if (!sessionId) {
			return {
				user: null,
				session: null,
			};
		}

		const result = await lucia.validateSession(sessionId);
		// next.js throws when you attempt to set cookie when rendering page
		try {
			if (result.session?.fresh) {
				const sessionCookie = lucia.createSessionCookie(result.session.id);
				cookies().set(
					sessionCookie.name,
					sessionCookie.value,
					sessionCookie.attributes,
				);
			}
			if (!result.session) {
				const sessionCookie = lucia.createBlankSessionCookie();
				cookies().set(
					sessionCookie.name,
					sessionCookie.value,
					sessionCookie.attributes,
				);
			}
		} catch {}
		return result;
	},
);
