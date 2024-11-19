/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config) => {
		config.externals.push("@node-rs/argon2", "@node-rs/bcrypt");
		return config;
	},
	experimental: {
		serverComponentsExternalPackages: ["@node-rs/argon2"],
	},
	redirects: async () => {
		return [
			{
				source: "/terms-and-conditions",
				destination: "/terms",
				permanent: true,
			},
			{
				source: "/tnc",
				destination: "/terms",
				permanent: true,
			},
			{
				source: "/refund",
				destination: "/refunds",
				permanent: true,
			},
			{
				source: "/refund-policy",
				destination: "/refunds",
				permanent: true,
			},
			{
				source: "/contact",
				destination: "/support",
				permanent: true,
			},
		];
	},
	async headers() {
		return [
			{
				source: "/api/payment-webhook-notification",
				headers: [
					{ key: "Access-Control-Allow-Origin", value: "*" },
					{ key: "Access-Control-Allow-Methods", value: "POST" },
					{
						key: "Access-Control-Allow-Headers",
						value: "Content-Type, x-webhook-signature, x-webhook-timestamp",
					},
				],
			},
		];
	},
};

export default nextConfig;
