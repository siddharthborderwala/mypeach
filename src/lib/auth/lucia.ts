import { cookies } from "next/headers";
import { cache } from "react";
import { Lucia } from "lucia";
import { RedisAdapter } from "./redis-adapter";
import { AUTH_SESSION, SESSION } from "../sessions";
import { fromBase64 } from "../utils";
import type { ValidateRequestResult } from "./client-server-utils";

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
		name: AUTH_SESSION,
		expires: false,
		attributes: {
			secure: process.env.NODE_ENV === "production",
		},
	},
	getUserAttributes: (sessionAttributes) => {
		return {
			username: sessionAttributes.username,
		} satisfies DatabaseUserAttributes;
	},
});

export const validateRequest = cache(
	async (): Promise<ValidateRequestResult> => {
		const authSessionId = cookies().get(AUTH_SESSION)?.value ?? null;

		if (!authSessionId) {
			const anonymousSession = cookies().get(SESSION)?.value ?? null;

			if (anonymousSession) {
				const result = JSON.parse(fromBase64(anonymousSession)) as object;

				if (
					"userId" in result &&
					typeof result.userId === "string" &&
					"sessionId" in result &&
					typeof result.sessionId === "string"
				) {
					return {
						anonymousUser: {
							id: result.userId,
						},
						session: {
							id: result.sessionId,
							userId: result.userId,
						},
					};
				}
			}

			return { user: null, authSession: null };
		}

		const result = await lucia.validateSession(authSessionId);
		try {
			if (result.session?.fresh) {
				const sessionCookie = lucia.createSessionCookie(result.session.id);
				cookies().set(
					sessionCookie.name,
					sessionCookie.value,
					sessionCookie.attributes,
				);
			}
			// next.js throws when you attempt to set cookie when rendering page
			if (!result.session) {
				const sessionCookie = lucia.createBlankSessionCookie();
				cookies().set(
					sessionCookie.name,
					sessionCookie.value,
					sessionCookie.attributes,
				);
			}
		} catch {}

		if (!result.user) {
			return { user: null, authSession: null };
		}

		return { user: result.user, authSession: result.session };
	},
);
