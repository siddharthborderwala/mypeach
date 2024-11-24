"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Play } from "@phosphor-icons/react";
import { motion } from "framer-motion";

const MotionDialogTrigger = motion.create(DialogTrigger);

const MotionDialogContent = motion.create(DialogContent);

export function VideoDialog() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<MotionDialogTrigger
				className="relative mb-4 rounded-xl border group transition-transform hover:-translate-y-2 duration-300"
				initial={{ opacity: 0, y: "12rem", filter: "blur(2px)" }}
				animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
				exit={{ opacity: 0, y: "12rem", filter: "blur(2px)" }}
				transition={{
					bounce: 0.15,
					duration: 0.5,
					delay: 1,
				}}
			>
				<img
					src="/social-preview.jpg"
					alt="Get started with Peach"
					className="w-full h-full object-cover filter rounded-xl"
				/>
				<div className="absolute rounded-xl inset-0 bg-foreground/10 transition-all duration-300 group-hover:bg-foreground/5" />
				<div className="group-hover:scale-110 transition-all duration-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-foreground/80 backdrop-blur-sm rounded-full p-3 shadow">
					<Play weight="fill" className="text-background h-8 w-8 shadow" />
				</div>
				<p className="absolute w-full text-left bottom-[-1.5rem] left-2 text-sm text-foreground/70">
					Get started with Peach
				</p>
			</MotionDialogTrigger>
			<MotionDialogContent
				isCloseButtonHidden={true}
				overlayClassName="bg-foreground/20 backdrop-blur-[2px]"
				className="block !rounded-2xl max-w-full overflow-hidden !w-[54rem] !h-[30rem] p-1"
			>
				<div className="w-full h-full bg-background">
					<iframe
						height="100%"
						width="100%"
						src="https://www.youtube.com/embed/rjGqJQABduc?si=DCpOVRBPqS18LYJh&amp;start=2"
						allowFullScreen={true}
						title="Get started with Peach for Designers"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerPolicy="strict-origin-when-cross-origin"
						className="rounded-xl overflow-hidden"
					/>
				</div>
			</MotionDialogContent>
		</Dialog>
	);
}
