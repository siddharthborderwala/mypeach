"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { isMobileUA } from "@/lib/utils";

const PAN_THRESHOLD = 160;

function ZoomedPreview({
	imageHeight,
	imageWidth,
	thumbnailFileStorageKey,
}: {
	imageHeight: number;
	imageWidth: number;
	thumbnailFileStorageKey: string | null;
}) {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.15 }}
			className="fixed overflow-hidden top-1/2 -translate-y-1/2 left-3/4 -translate-x-1/2 bg-white/10 backdrop-blur-sm border rounded-full h-[384px] w-[384px] z-50"
		>
			<div
				className="absolute origin-center"
				style={{
					height: imageHeight,
					width: imageWidth,
					backgroundSize: "contain",
					backgroundImage: `url(${getDesignThumbnailURL(thumbnailFileStorageKey, 1200)})`,
					scale: 2,
					transform: "translate(var(--preview-x), var(--preview-y))",
				}}
			/>
		</motion.div>
	);
}

export function ZoomedImage({
	thumbnailFileStorageKey,
	name,
	children,
}: {
	thumbnailFileStorageKey: string | null;
	name: string;
	children?: React.ReactNode;
}) {
	const imgRef = useRef<HTMLImageElement | null>(null);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const [isOpen, setIsOpen] = useState(false);
	const [panY, setPanY] = useState(0);
	const [isHovering, setIsHovering] = useState(false);

	const handlePan = useCallback((event: PointerEvent, info: PanInfo) => {
		if (info.offset.y < 0) return;
		setPanY(info.offset.y);
		if (info.offset.y > PAN_THRESHOLD) {
			setIsOpen(false);
		}
	}, []);

	const handlePanEnd = useCallback((event: PointerEvent, info: PanInfo) => {
		setPanY(0);
	}, []);

	const isMobile = useMemo(() => isMobileUA(navigator.userAgent), []);

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
		<>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<div className="relative h-[65svh] w-full bg-[hsl(0,3%,94%)] sm:bg-white border-b sm:border shadow-inner sm:shadow-none flex items-center justify-center">
						{isOpen ? null : (
							<ImageWithFallback
								ref={imgRef}
								alt={name}
								src={getDesignThumbnailURL(thumbnailFileStorageKey, 1200)}
								className="relative max-w-[80%] max-h-[75%] sm:max-w-[90%] sm:max-h-[90%] select-none drop-shadow-xl"
								onMouseEnter={
									isMobile
										? undefined
										: () => {
												if (timeoutRef.current)
													clearTimeout(timeoutRef.current);
												setIsHovering(true);
											}
								}
								onMouseLeave={
									isMobile
										? undefined
										: () => {
												// give a grace period before setting isHovering to false
												timeoutRef.current = setTimeout(() => {
													setIsHovering(false);
												}, 500);
											}
								}
								onMouseMove={
									isMobile
										? undefined
										: (e) => {
												// consider image's center as the origin and get mouse coordinates relative to that
												const imgRect = imgRef.current?.getBoundingClientRect();

												const offsetTop = imgRect?.y ?? 0;
												const offsetLeft = imgRect?.x ?? 0;
												const imageWidth = imgRect?.width ?? 0;
												const imageHeight = imgRect?.height ?? 0;

												const imgCenterX = offsetLeft + imageWidth / 2;
												const imgCenterY = offsetTop + imageHeight / 2;

												const mouseX = imgCenterX - e.clientX;
												const mouseY = imgCenterY - e.clientY;

												document.body.style.setProperty(
													"--preview-x",
													`${mouseX}px`,
												);
												document.body.style.setProperty(
													"--preview-y",
													`${mouseY}px`,
												);
											}
								}
							/>
						)}
						{children}
					</div>
				</DialogTrigger>
				<DialogContent
					className="w-[100dvw] h-[100dvh] max-w-none p-0 bg-transparent block border-0 ring-0"
					isCloseButtonHidden={true}
				>
					{!panY ? (
						<DialogClose asChild>
							<Button
								variant="secondary"
								className="p-0 h-8 w-8 absolute top-4 right-4"
							>
								<X weight="bold" className="h-5 w-5" />
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
							<ImageWithFallback
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
			<AnimatePresence>
				{isHovering ? (
					<ZoomedPreview
						imageHeight={imgRef.current?.height ?? 0}
						imageWidth={imgRef.current?.width ?? 0}
						thumbnailFileStorageKey={thumbnailFileStorageKey}
					/>
				) : null}
			</AnimatePresence>
		</>
	);
}
