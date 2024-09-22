import { defineConfig } from "@trigger.dev/sdk/v3";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";

export default defineConfig({
	project: "proj_wojrgrrhrubpqptwqgcc",
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
