import { createClient } from "redis";
import type { DatabaseSession, DatabaseUser, UserId, Adapter } from "lucia";

export class RedisAdapter implements Adapter {
	private client: ReturnType<typeof createClient>;
	private connectionPromise: Promise<void>;

	constructor(redisUrl: string) {
		this.client = createClient({ url: redisUrl });
		this.connectionPromise = this.connect();
	}

	private async connect(): Promise<void> {
		try {
			await this.client.connect();
		} catch (error) {
			console.error("Failed to connect to Redis:", error);
			throw error;
		}
	}

	private async ensureConnection(): Promise<void> {
		await this.connectionPromise;
	}

	async deleteExpiredSessions(): Promise<void> {
		await this.ensureConnection();
	}

	async deleteSession(sessionId: string): Promise<void> {
		await this.ensureConnection();
		await this.client.del(`session:${sessionId}`);
	}

	async deleteUserSessions(userId: UserId): Promise<void> {
		await this.ensureConnection();
		const sessionIds = await this.client.sMembers(`user:${userId}:sessions`);
		if (sessionIds.length === 0) return;

		const pipeline = this.client.multi();
		for (const sessionId of sessionIds) {
			pipeline.del(`session:${sessionId}`);
		}
		pipeline.del(`user:${userId}:sessions`);

		await pipeline.exec();
	}

	async getSessionAndUser(
		sessionId: string,
	): Promise<[DatabaseSession | null, DatabaseUser | null]> {
		await this.ensureConnection();
		const sessionData = await this.client.get(`session:${sessionId}`);
		if (!sessionData) return [null, null];

		const session = JSON.parse(sessionData) as DatabaseSession;
		session.expiresAt = new Date(session.expiresAt);

		const userData = await this.client.get(`user:${session.userId}`);
		if (!userData) return [session, null];

		const user = JSON.parse(userData) as DatabaseUser;
		return [session, user];
	}

	async getUserSessions(userId: UserId): Promise<DatabaseSession[]> {
		await this.ensureConnection();
		const sessionIds = await this.client.sMembers(`user:${userId}:sessions`);
		const sessions = await Promise.all(
			sessionIds.map(async (sessionId) => {
				const sessionData = await this.client.get(`session:${sessionId}`);
				return sessionData
					? (JSON.parse(sessionData) as DatabaseSession)
					: null;
			}),
		);
		return sessions.filter(
			(session): session is DatabaseSession => session !== null,
		);
	}

	async setSession(session: DatabaseSession): Promise<void> {
		await this.ensureConnection();
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
	}

	async updateSessionExpiration(
		sessionId: string,
		expiresAt: Date,
	): Promise<void> {
		await this.ensureConnection();
		const sessionData = await this.client.get(`session:${sessionId}`);
		if (!sessionData) return;

		const session = JSON.parse(sessionData) as DatabaseSession;
		session.expiresAt = new Date(expiresAt);
		await this.client.set(`session:${sessionId}`, JSON.stringify(session), {
			EX: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
		});
	}
}
