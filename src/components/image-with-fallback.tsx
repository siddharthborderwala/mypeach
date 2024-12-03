"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, forwardRef } from "react";

interface ImageWithFallbackProps
	extends React.ImgHTMLAttributes<HTMLImageElement> {
	src: string;
	fallbackSrc?: string;
	alt?: string;
}

const ImageWithFallback = forwardRef<HTMLImageElement, ImageWithFallbackProps>(
	(
		{ src, fallbackSrc = "/logo.png", className, alt = "", onError, ...props },
		ref,
	) => {
		const [hasError, setHasError] = useState(false);

		// biome-ignore lint/correctness/useExhaustiveDependencies(src): This is a false positive
		useEffect(() => {
			// Reset the error state when src changes
			setHasError(false);
		}, [src]);

		const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
			setHasError(true);
			if (onError) {
				onError(e);
			}
		};

		if (hasError || !src) {
			// Render your custom fallback HTML
			return (
				<div
					ref={ref}
					className={cn(
						"flex flex-col items-center justify-center border rounded",
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

		// Render the normal image
		return (
			<img
				{...props}
				ref={ref}
				src={src}
				alt={alt}
				className={cn(
					"border-none flex items-center justify-center",
					className,
				)}
				onError={handleError}
			/>
		);
	},
);

export default ImageWithFallback;
