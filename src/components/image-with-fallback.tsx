"use client";

import type { ImgHTMLAttributes } from "react";

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
	fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
	src,
	fallbackSrc = "/favicon.ico",
	...props
}) => {
	return (
		<img
			{...props}
			alt={props.alt || ""}
			src={src}
			onError={(e) => {
				e.currentTarget.onerror = null;
				e.currentTarget.src = fallbackSrc;
			}}
		/>
	);
};

export default ImageWithFallback;
