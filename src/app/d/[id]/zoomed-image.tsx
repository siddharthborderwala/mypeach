"use client";

import { motion, type PanInfo } from "framer-motion";
import { useEffect, useState } from "react";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import ImageWithFallback from "@/components/image-with-fallback";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const MotionImageWithFallback = motion(ImageWithFallback);

export function ZoomedImage({
	thumbnailFileStorageKey,
	name,
}: {
	thumbnailFileStorageKey: string | null;
	name: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [panY, setPanY] = useState(0);

	const handlePan = (_: unknown, info: PanInfo) => {
		setPanY(info.offset.y);
		if (info.offset.y > 200) {
			setIsOpen(false);
		}
	};

	const handlePanEnd = () => {
		setPanY(0);
	};

	useEffect(() => {
		if (isOpen) {
			setPanY(0);
		}
	}, [isOpen]);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
	}, [isOpen]);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<div className="relative h-[60svh] w-full bg-[hsl(0,0%,87%)] border-b shadow-inner flex items-center justify-center">
					<MotionImageWithFallback
						src={getDesignThumbnailURL(thumbnailFileStorageKey, 1200)}
						alt={name}
						className="w-full h-[80%] object-contain select-none pointer-events-none drop-shadow-lg"
						loading="lazy"
					/>
				</div>
			</DialogTrigger>
			<DialogContent
				className="w-[100dvw] h-[100dvh] p-0 bg-transparent block border-0 ring-0"
				isCloseButtonHidden={true}
			>
				<motion.div
					onPan={handlePan}
					onPanEnd={handlePanEnd}
					animate={{
						y: panY,
					}}
					transition={{ bounce: 0.2 }}
					className="w-full h-full bg-black flex items-center justify-center"
				>
					<MotionImageWithFallback
						src={getDesignThumbnailURL(thumbnailFileStorageKey, 1200)}
						alt={name}
						className="w-[80%] select-none pointer-events-none drop-shadow-lg"
						loading="lazy"
					/>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
