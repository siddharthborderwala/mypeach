import { generateId } from "lucia";
import { sha256Digest } from "../crypto";

export const TOKEN_LENGTH = 36;

export const generateToken = async () => {
	const token = generateId(TOKEN_LENGTH);
	const hashedToken = await sha256Digest(token);
	return { token, hashedToken };
};
