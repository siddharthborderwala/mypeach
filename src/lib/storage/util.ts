import { env } from "../env.mjs";

export function getDesignFileStorageKey(id: string) {
	return `raw-design-files/${id}.tiff`;
}

export function getDesignThumbnailFileStorageKey(id: string) {
	return {
		folder: `design-thumbnails/${id}`,
		2000: `design-thumbnails/${id}/2000.webp`,
		1200: `design-thumbnails/${id}/1200.webp`,
	};
}

// TODO: change this to env variable
export function getUserContentUrl(key: string) {
	return `${env.NEXT_PUBLIC_USERCONTENT_BASE_URL}/${key}`;
}
