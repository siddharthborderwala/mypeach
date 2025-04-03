import { createClient } from "redis";
import type { DatabaseSession, DatabaseUser, UserId, Adapter } from "lucia";

export class RedisAdapter implements Adapter {
	private client: ReturnType<typeof createClient>;

	constructor(redisUrl: string) {
		this.client = createClient({ url: redisUrl });
	}

	private async connect(): Promise<void> {
		try {
			await this.client.connect();
		} catch (error) {
			console.error("Failed to connect to Redis:", error);
			throw error;
		}
	}

	async deleteExpiredSessions(): Promise<void> {
		return Promise.resolve();
	}

	async deleteSession(sessionId: string): Promise<void> {
		await this.connect();
		await this.client.del(`session:${sessionId}`);
		await this.client.disconnect();
	}

	async deleteUserSessions(userId: UserId): Promise<void> {
		await this.connect();
		const sessionIds = await this.client.sMembers(`user:${userId}:sessions`);
		if (sessionIds.length === 0) return;

		const pipeline = this.client.multi();
		for (const sessionId of sessionIds) {
			pipeline.del(`session:${sessionId}`);
		}
		pipeline.del(`user:${userId}:sessions`);

		await pipeline.exec();
		await this.client.disconnect();
	}

	async getSessionAndUser(
		sessionId: string,
	): Promise<[DatabaseSession | null, DatabaseUser | null]> {
		await this.connect();
		const sessionData = await this.client.get(`session:${sessionId}`);
		if (!sessionData) return [null, null];

		const session = JSON.parse(sessionData) as DatabaseSession;
		session.expiresAt = new Date(session.expiresAt);

		const userData = await this.client.get(`user:${session.userId}`);
		if (!userData) return [session, null];

		await this.client.disconnect();

		const user = JSON.parse(userData) as DatabaseUser;
		return [session, user];
	}

	async getUserSessions(userId: UserId): Promise<DatabaseSession[]> {
		await this.connect();
		const sessionIds = await this.client.sMembers(`user:${userId}:sessions`);
		const sessions = await Promise.all(
			sessionIds.map(async (sessionId) => {
				const sessionData = await this.client.get(`session:${sessionId}`);
				return sessionData
					? (JSON.parse(sessionData) as DatabaseSession)
					: null;
			}),
		);
		await this.client.disconnect();
		return sessions.filter(
			(session): session is DatabaseSession => session !== null,
		);
	}

	async setSession(session: DatabaseSession): Promise<void> {
		await this.connect();
		const expiresAt = new Date(session.expiresAt);
		// Store session data with expiration
		await this.client.set(`session:${session.id}`, JSON.stringify(session), {
			EX: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
		});

		// Add session to user's session set
		await this.client.sAdd(`user:${session.userId}:sessions`, session.id);

		// Store user data (if not already stored)
		const userExists = await this.client.exists(`user:${session.userId}`);
		if (userExists === 0) {
			// Extract user attributes from session
			const attributes = session.attributes || {};
			await this.client.set(
				`user:${session.userId}`,
				JSON.stringify({ id: session.userId, attributes }),
			);
		}

		await this.client.disconnect();
	}

	async updateSessionExpiration(
		sessionId: string,
		expiresAt: Date,
	): Promise<void> {
		await this.connect();
		const sessionData = await this.client.get(`session:${sessionId}`);
		if (!sessionData) return;

		const session = JSON.parse(sessionData) as DatabaseSession;
		session.expiresAt = new Date(expiresAt);
		await this.client.set(`session:${sessionId}`, JSON.stringify(session), {
			EX: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
		});
		await this.client.disconnect();
	}
}
