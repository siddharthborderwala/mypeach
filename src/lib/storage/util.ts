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
export function getFileURL(key: string) {
	return `https://peach-assets-dev.r2.cloudflarestorage.com/${key}`;
}

// TODO: change this to env variable
export function getUserContentUrl(key: string) {
	return `https://pub-e14483caced440b3a30b29dd94e63322.r2.dev/${key}`;
}
