import { useCallback } from "react";
import { appBaseURL, isMobileUA } from "@/lib/utils";
import { toast } from "sonner";

export const useShareDesign = (designId: string) => {
	const handleShare = useCallback(() => {
		const designURL = `${appBaseURL}/d/${designId}`;
		const isMobile = isMobileUA(navigator.userAgent);

		if (isMobile && navigator.share && navigator.canShare({ url: designURL })) {
			navigator
				.share({
					url: designURL,
				})
				.catch(() => {
					// user decided to not do anything
				});
		} else {
			navigator.clipboard
				.writeText(designURL)
				.then(() => toast.success("Copied design URL"))
				.catch(() => toast.error("Failed to copy design URL"));
		}
	}, [designId]);

	return handleShare;
};
