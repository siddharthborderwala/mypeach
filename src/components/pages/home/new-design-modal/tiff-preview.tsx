"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/spinner";

interface TiffPreviewProps {
	file: File | null;
}

export function TiffPreview({ file }: TiffPreviewProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!file) {
			setPreviewUrl(null);
			return;
		}

		const renderTiffPreview = async () => {
			setIsLoading(true);
			try {
				const worker = new Worker(
					new URL("./tiff-worker.js", import.meta.url),
					{
						type: "module",
					},
				);

				worker.onmessage = (event) => {
					if (event.data.error) {
						console.error("Error rendering TIFF preview:", event.data.error);
						setPreviewUrl(null);
					} else {
						const { buffer, width, height, type } = event.data;
						const blob = new Blob([buffer], { type });
						const previewUrl = URL.createObjectURL(blob);
						setPreviewUrl(previewUrl);
					}
					setIsLoading(false);
					worker.terminate();
				};

				const arrayBuffer = await file.arrayBuffer();
				worker.postMessage({ arrayBuffer });
			} catch (error) {
				console.error("Error setting up Web Worker:", error);
				setPreviewUrl(null);
				setIsLoading(false);
			}
		};

		renderTiffPreview();
	}, [file]);

	return (
		<div className="w-full h-full flex flex-col items-center justify-center bg-muted rounded-lg">
			{isLoading ? (
				<Spinner size={20} />
			) : previewUrl ? (
				<img
					src={previewUrl}
					alt="TIFF Preview"
					className="max-w-full max-h-[300px] object-contain"
				/>
			) : file ? (
				<p>Error loading preview</p>
			) : (
				<p>No file selected</p>
			)}
		</div>
	);
}
