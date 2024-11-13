"use client";

import ImageWithFallback from "@/components/image-with-fallback";
import type { DesignData } from "@/lib/actions/designs";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import Separator from "@/components/ui/separator";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

function PurchasedDesignPreview_({
	design,
}: {
	design: DesignData;
}) {
	const [isDownloading, setIsDownloading] = useState(false);

	const { mutateAsync: downloadFile } = useMutation({
		mutationKey: ["download"],
		mutationFn: ({
			fileName,
		}: {
			fileName: string;
		}) => {
			return fetch("/api/download", {
				method: "PUT",
				body: JSON.stringify({
					fileName,
				}),
			});
		},
	});

	const handleDownload = async () => {
		try {
			setIsDownloading(true);
			const response = await downloadFile({
				fileName: design.originalFileStorageKey,
			});

			if (!response.ok) {
				throw new Error("Failed to download the file");
			}

			const data = await response.json();
			const { url } = data;

			if (!url) {
				throw new Error("No URL returned");
			}

			const link = document.createElement("a");
			link.href = url;
			link.setAttribute("download", "design");
			document.body.appendChild(link);
			link.click();
			link.parentNode?.removeChild(link);
		} catch (error) {
			toast.error("Failed to download the file");
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div className="border rounded-lg p-4 shadow-sm">
			<ImageWithFallback
				suppressHydrationWarning
				src={getDesignThumbnailURL(design.thumbnailFileStorageKey, 1200)}
				width="100%"
				className="aspect-square rounded flex items-center justify-center select-none pointer-events-none object-cover"
			/>
			<div className="flex flex-col mt-2 text-left">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold truncate">{design.name}</h3>
				</div>
				<p className="text-sm text-muted-foreground truncate">
					{design.metadata.fileDPI} DPI
				</p>
			</div>
			<Separator />
			<Button
				className="w-full mt-3"
				onClick={handleDownload}
				disabled={isDownloading}
			>
				{isDownloading ? "Downloading..." : "Download"}
			</Button>
		</div>
	);
}

const PurchasedDesignPreview = memo(PurchasedDesignPreview_);

export default PurchasedDesignPreview;
