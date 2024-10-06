import { defineConfig } from "@trigger.dev/sdk/v3";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";

const project =
	process.env.NODE_ENV === "production"
		? "proj_vkutkwszmpyewlwnavsr"
		: "proj_maroqjmxibdowszyhuhv";

export default defineConfig({
	project,
	logLevel: "log",
	retries: {
		enabledInDev: true,
		default: {
			maxAttempts: 3,
			minTimeoutInMs: 1000,
			maxTimeoutInMs: 10000,
			factor: 2,
			randomize: true,
		},
	},
	build: {
		external: ["sharp"],
		extensions: [
			prismaExtension({
				schema: "prisma/schema.prisma",
			}),
		],
	},
});
