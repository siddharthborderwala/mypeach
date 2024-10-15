import {
	AUTH_SESSION,
	createAnonymousSessionCookie,
	SESSION,
} from "@/lib/sessions";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	if (
		!request.cookies.get(AUTH_SESSION)?.value &&
		!request.cookies.get(SESSION)?.value
	) {
		const response = NextResponse.next();
		const c = createAnonymousSessionCookie();
		response.cookies.set(c.name, c.value, c.attributes);
		return response;
	}
}
