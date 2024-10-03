"use client";

import { cn } from "@/lib/utils";
import type * as React from "react";
import { useState } from "react";

interface ImageWithFallbackProps
	extends React.ObjectHTMLAttributes<HTMLImageElement> {
	src: string;
	fallbackSrc?: string;
	alt?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
	src,
	fallbackSrc = "/logo.png",
	className,
	alt = "",
	onError,
	...props
}) => {
	const [effectiveSrc, setEffectiveSrc] = useState(src || fallbackSrc);

	if (effectiveSrc === fallbackSrc) {
		return (
			<div
				className={cn(
					"flex items-center justify-center border rounded",
					className,
				)}
			>
				<img
					src={fallbackSrc}
					alt={alt}
					className="w-8 h-8 md:w-10 md:h-10 filter grayscale"
				/>
			</div>
		);
	}

	return (
		<img
			{...props}
			src={effectiveSrc}
			alt={alt}
			className={cn("border-none flex items-center justify-center", className, {
				"object-none": effectiveSrc === fallbackSrc,
			})}
			onError={(e) => {
				setEffectiveSrc(fallbackSrc);
				onError?.(e);
			}}
		/>
	);
};

export default ImageWithFallback;
