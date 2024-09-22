import { atom } from "jotai";

export const designIdAtom = atom<string | undefined>(undefined);
export const isDesignCreatedInDbAtom = atom(false);
export const isDesignSavedAtom = atom(false);
export const designDetailsAtom = atom<
	| {
			name: string;
			price: number;
			fileDPI: number;
			tags: string;
	  }
	| undefined
>(undefined);
