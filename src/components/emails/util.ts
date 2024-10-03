export const appBaseURL = (() => {
	if (process.env.VERCEL_GIT_COMMIT_REF === "main") {
		return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
	}
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}
	return "http://localhost:3000";
})();
