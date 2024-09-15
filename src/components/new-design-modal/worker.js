let xhr;

self.onmessage = async ({ data }) => {
	const { type } = data;

	if (type === "cancelUpload") {
		if (xhr && xhr.readyState !== XMLHttpRequest.DONE) {
			xhr.abort();
			self.postMessage({ type: "cancelled", message: data.reason });
		}
		return;
	}

	if (type === "upload") {
		xhr = new XMLHttpRequest();
		xhr.open("PUT", data.presignedUrl, true);
		xhr.setRequestHeader("Content-Type", data.file.type);

		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable) {
				const progress = (e.loaded / e.total) * 100;
				self.postMessage({ type: "progress", progress });
			}
		};

		xhr.onloadstart = (e) => {
			self.postMessage({ type: "start" });
		};

		xhr.onload = (e) => {
			if (xhr.status === 200) {
				self.postMessage({ type: "complete" });
			} else {
				self.postMessage({ type: "error", message: xhr.statusText });
			}
		};

		xhr.onerror = (e) => {
			self.postMessage({ type: "error", message: e.message });
		};

		xhr.onabort = () => {
			self.postMessage({ type: "cancelled" });
		};

		xhr.send(data.file);
	}
};
