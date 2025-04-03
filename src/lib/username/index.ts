import { generateRandomInteger } from "oslo/crypto";
import { adjectives } from "./adjectives";
import { animals } from "./animals";

export function generateUsername(options?: {
	separator?: string;
}): string {
	const adjective = adjectives[generateRandomInteger(adjectives.length - 1)];
	const animal = animals[generateRandomInteger(animals.length - 1)];

	const separator = options?.separator ?? "";

	return `${adjective}${separator}${animal}${generateRandomInteger(1000)}`;
}
