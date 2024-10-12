import { createClient, type RedisClientType } from "redis";
import { env } from "../env.mjs";

declare global {
	// allow global `var` declarations
	// eslint-disable-next-line no-var
	var redis: RedisClientType | undefined;
}

// biome-ignore lint/suspicious/noRedeclare: it's fine
export const redis = global.redis || createClient({ url: env.REDIS_URL });

if (process.env.NODE_ENV !== "production") global.redis = redis;
