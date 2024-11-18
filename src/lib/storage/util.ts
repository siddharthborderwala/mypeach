import { env } from "../env.mjs";

export function getDesignFileStorageKey(id: string) {
	return `raw-design-files/${id}.tiff`;
}

export function getDesignThumbnailFileStorageKey(id: string) {
	return {
		folder: `design-thumbnails/${id}`,
		social: `design-thumbnails/${id}/social.jpeg`,
		600: `design-thumbnails/${id}/600.webp`,
		1200: `design-thumbnails/${id}/1200.webp`,
	};
}

export function getUserContentUrl(key: string) {
	return `${env.NEXT_PUBLIC_USERCONTENT_BASE_URL}/${key}`;
}

export function getDesignThumbnailURL(key: string | null, width: 600 | 1200) {
	if (!key) {
		return "";
	}
	return getUserContentUrl(`${key}/${width}.webp`);
}

export function getDesignSocialImageURL(id: string) {
	return getUserContentUrl(getDesignThumbnailFileStorageKey(id).social);
}
