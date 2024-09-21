import { sha256 } from "oslo/crypto";
import { encodeHex } from "oslo/encoding";

export async function sha256Digest(text: string) {
	const data = new TextEncoder().encode(text);
	const hash = await sha256(data);
	return encodeHex(hash);
}
