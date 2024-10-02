import { useQueryClient } from "@tanstack/react-query";

export function useRefetchDesigns() {
	const queryClient = useQueryClient();

	const refetchDesigns = () => {
		queryClient.invalidateQueries({ queryKey: ["designs"] });
	};

	return refetchDesigns;
}
