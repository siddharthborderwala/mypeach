"use client";

import { createContext, useContext } from "react";
import type { ValidateRequestResult } from "@/lib/auth/client-server-utils";
import {
	isAnonymousSession,
	isAuthSession,
} from "@/lib/auth/client-server-utils";

export const AuthContext = createContext<ValidateRequestResult | undefined>(
	undefined,
);

export function AuthProvider({
	children,
	auth,
}: {
	children: React.ReactNode;
	auth: ValidateRequestResult;
}) {
	return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth():
	| {
			isLoggedIn: true;
			isAnonymous: false;
			userId: string;
	  }
	| {
			isLoggedIn: false;
			isAnonymous: true;
			anonymousUserId: string;
	  } {
	const auth = useContext(AuthContext);

	if (!auth) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	if (isAuthSession(auth)) {
		return {
			isLoggedIn: true,
			isAnonymous: false,
			userId: auth.user.id,
		};
	}

	if (isAnonymousSession(auth)) {
		return {
			isLoggedIn: false,
			isAnonymous: true,
			anonymousUserId: auth.anonymousUser.id,
		};
	}

	throw new Error("Invalid auth state - no user or anonymous user found");
}
