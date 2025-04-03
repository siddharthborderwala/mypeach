import { useCallback } from "react";
import { appBaseURL, isMobileUA } from "@/lib/utils";
import { toast } from "sonner";

export const useShareCollection = (collectionId: string) => {
	const handleShare = useCallback(() => {
		const collectionUrl = `${appBaseURL}/c/${collectionId}`;
		const isMobile = isMobileUA(navigator.userAgent);

		if (
			isMobile &&
			navigator.share &&
			navigator.canShare({ url: collectionUrl })
		) {
			navigator
				.share({
					url: collectionUrl,
				})
				.catch(() => {
					// user decided to not do anything
				});
		} else {
			navigator.clipboard
				.writeText(collectionUrl)
				.then(() => toast.success("Copied collection URL"))
				.catch(() => toast.error("Failed to copy collection URL"));
		}
	}, [collectionId]);

	return handleShare;
};
