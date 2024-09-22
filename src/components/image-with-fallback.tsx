"use client";

import { useState } from "react";

interface ImageWithFallbackProps
	extends React.ImgHTMLAttributes<HTMLImageElement> {
	fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
	src,
	fallbackSrc = "/favicon.ico",
	alt = "",
	...props
}) => {
	const [imgSrc, setImgSrc] = useState(src);

	const handleError = () => {
		setImgSrc(fallbackSrc);
	};

	return <img {...props} src={imgSrc} alt={alt} onError={handleError} />;
};

export default ImageWithFallback;
