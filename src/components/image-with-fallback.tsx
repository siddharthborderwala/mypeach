"use client";

import { cn } from "@/lib/utils";
import type * as React from "react";

interface ImageWithFallbackProps
	extends React.ObjectHTMLAttributes<HTMLObjectElement> {
	src: string;
	fallbackSrc?: string;
	alt?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
	src,
	fallbackSrc = "/favicon.ico",
	className,
	alt = "",
	...props
}) => {
	return (
		<object
			data={src}
			type="image/png"
			{...props}
			className={cn("border-none flex items-center justify-center", className)}
		>
			<img src={fallbackSrc} alt={alt} className="w-10 h-10" />
		</object>
	);
};

export default ImageWithFallback;
