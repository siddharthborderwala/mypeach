import type { Session, User } from "lucia";

export type ValidateRequestResult =
	| { user: User; authSession: Session }
	| { user: null; authSession: null }
	| {
			anonymousUser: {
				id: string;
			};
			session: {
				id: string;
				userId: string;
			};
	  };

export function isAuthSession(
	result: ValidateRequestResult,
): result is { user: User; authSession: Session } {
	return "authSession" in result && result.authSession !== null;
}

export function isAnonymousSession(result: ValidateRequestResult): result is {
	anonymousUser: { id: string };
	session: { id: string; expiresAt: Date; fresh: boolean; userId: string };
} {
	return "anonymousUser" in result && result.anonymousUser !== null;
}
