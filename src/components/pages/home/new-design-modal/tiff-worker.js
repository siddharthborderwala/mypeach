import UTIF from "utif";

self.onmessage = async (event) => {
	try {
		const { arrayBuffer, maxWidth = 1200, maxHeight = 1600 } = event.data;
		const ifds = UTIF.decode(arrayBuffer);
		UTIF.decodeImage(arrayBuffer, ifds[0]);
		const firstPage = ifds[0];
		const rgba = UTIF.toRGBA8(firstPage);

		const originalWidth = firstPage.width;
		const originalHeight = firstPage.height;

		// Calculate new dimensions while maintaining aspect ratio
		let newWidth = originalWidth;
		let newHeight = originalHeight;

		if (newWidth > maxWidth) {
			newWidth = maxWidth;
			newHeight = (originalHeight * maxWidth) / originalWidth;
		}
		if (newHeight > maxHeight) {
			newHeight = maxHeight;
			newWidth = (originalWidth * maxHeight) / originalHeight;
		}

		// Create a temporary canvas for the original image
		const tempCanvas = new OffscreenCanvas(originalWidth, originalHeight);
		const tempCtx = tempCanvas.getContext("2d");
		if (tempCtx) {
			const imageData = tempCtx.createImageData(originalWidth, originalHeight);
			imageData.data.set(rgba);
			tempCtx.putImageData(imageData, 0, 0);

			// Create a new canvas for the resized image
			const canvas = new OffscreenCanvas(newWidth, newHeight);
			const ctx = canvas.getContext("2d");
			if (ctx) {
				// Draw the original image onto the new canvas, scaling it down
				ctx.drawImage(
					tempCanvas,
					0,
					0,
					originalWidth,
					originalHeight,
					0,
					0,
					newWidth,
					newHeight,
				);

				const blob = await canvas.convertToBlob({
					type: "image/png",
					quality: 0.8,
				});

				// Convert blob to ArrayBuffer
				const arrayBuffer = await blob.arrayBuffer();

				// Send the ArrayBuffer along with image dimensions and type
				self.postMessage(
					{
						buffer: arrayBuffer,
						width: newWidth,
						height: newHeight,
						type: blob.type,
					},
					[arrayBuffer],
				);
			} else {
				throw new Error("Could not get canvas context for resized image");
			}
		} else {
			throw new Error("Could not get canvas context for original image");
		}
	} catch (error) {
		self.postMessage({ error: error.message });
	}
};
