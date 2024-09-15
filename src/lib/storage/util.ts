export function getDesignFileStorageKey(id: string) {
	return `raw-design-files/${id}.tiff`;
}

export function getDesignThumbnailFileStorageKey(id: string) {
	return `design-thumbnails/${id}.webp`;
}

export function getFileURL(key: string) {
	return `https://peach-assets-dev.r2.cloudflarestorage.com/${key}`;
}
