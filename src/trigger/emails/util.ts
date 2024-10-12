export const appBaseURL = (() => {
	if (process.env.NODE_ENV === "production") {
		return "https://mypeach.vercel.app";
	}
	return "http://localhost:3000";
})();
