"use client";

import { motion, type PanInfo } from "framer-motion";
import { useEffect, useState } from "react";
import { getDesignThumbnailURL } from "@/lib/storage/util";
import ImageWithFallback from "@/components/image-with-fallback";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "@phosphor-icons/react";

const MotionImageWithFallback = motion(ImageWithFallback);

const PAN_THRESHOLD = 160;

export function ZoomedImage({
	thumbnailFileStorageKey,
	name,
	children,
}: {
	thumbnailFileStorageKey: string | null;
	name: string;
	children?: React.ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [panY, setPanY] = useState(0);

	const handlePan = (event: PointerEvent, info: PanInfo) => {
		if (info.offset.y < 0) return;
		setPanY(info.offset.y);
		if (info.offset.y > PAN_THRESHOLD) {
			setIsOpen(false);
		}
	};

	const handlePanEnd = (event: PointerEvent, info: PanInfo) => {
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
				<div className="relative h-[65svh] w-full bg-[hsl(0,3%,94%)] border-b shadow-inner flex items-center justify-center">
					{isOpen ? null : (
						<MotionImageWithFallback
							src={getDesignThumbnailURL(thumbnailFileStorageKey, 1200)}
							alt={name}
							className="max-w-[80%] max-h-[75%] object-contain select-none pointer-events-none drop-shadow-xl"
							loading="lazy"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
						/>
					)}
					{children}
				</div>
			</DialogTrigger>
			<DialogContent
				className="w-[100dvw] h-[100dvh] p-0 bg-transparent block border-0 ring-0"
				isCloseButtonHidden={true}
			>
				{!panY ? (
					<DialogClose asChild>
						<Button
							variant="secondary"
							className="p-0 h-8 w-8 absolute top-4 right-4"
						>
							<X weight="bold" className="h-6 w-6" />
						</Button>
					</DialogClose>
				) : null}
				<motion.div
					onPan={handlePan}
					onPanEnd={handlePanEnd}
					animate={{
						y: panY,
						scale: Math.max(1 - panY / 1000, 0.2),
						backgroundColor: `hsla(0, 0%, 0%, ${panY === 0 ? 1 : 1 - (panY / PAN_THRESHOLD)})`,
					}}
					transition={{ bounce: 0.2, duration: 0.15 }}
					className="w-full h-full"
				>
					<motion.div className="w-full h-full relative z-0 pointer-events-none">
						<MotionImageWithFallback
							initial={false}
							src={getDesignThumbnailURL(thumbnailFileStorageKey, 1200)}
							alt={name}
							loading="lazy"
							className="max-w-[90%] max-h-[90%] select-none"
							style={{
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
							}}
						/>
					</motion.div>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
