import UTIF from "utif";

self.onmessage = async (event) => {
	try {
		const { arrayBuffer } = event.data;
		const ifds = UTIF.decode(arrayBuffer);
		UTIF.decodeImage(arrayBuffer, ifds[0]);
		const firstPage = ifds[0];
		const rgba = UTIF.toRGBA8(firstPage);

		const canvas = new OffscreenCanvas(firstPage.width, firstPage.height);
		const ctx = canvas.getContext("2d");
		if (ctx) {
			const imageData = ctx.createImageData(firstPage.width, firstPage.height);
			imageData.data.set(rgba);
			ctx.putImageData(imageData, 0, 0);
			const blob = await canvas.convertToBlob();

			// Convert blob to ArrayBuffer
			const arrayBuffer = await blob.arrayBuffer();

			// Send the ArrayBuffer along with image dimensions and type
			self.postMessage(
				{
					buffer: arrayBuffer,
					width: firstPage.width,
					height: firstPage.height,
					type: blob.type,
				},
				[arrayBuffer],
			);
		} else {
			throw new Error("Could not get canvas context");
		}
	} catch (error) {
		self.postMessage({ error: error.message });
	}
};
