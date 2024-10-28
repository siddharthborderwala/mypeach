export const appBaseURL = (() => {
	if (process.env.NODE_ENV === "production") {
		return "https://mypeach.in";
	}
	return "http://localhost:3000";
})();
