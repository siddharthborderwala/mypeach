"use client";

import { Button } from "@/components/ui/button";
import { useShareDesign } from "@/hooks/use-share-design";
import { Export } from "@phosphor-icons/react";

export function ShareDesignButton({ designId }: { designId: string }) {
	const handleShare = useShareDesign(designId);

	return (
		<Button variant="outline" onClick={handleShare} className="h-12 flex-[1]">
			<Export weight="bold" />
			<span className="ml-2">Share</span>
		</Button>
	);
}
