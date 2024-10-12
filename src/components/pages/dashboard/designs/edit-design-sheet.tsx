"use client";

import { parseAsString, useQueryState } from "nuqs";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { DetailsForm } from "./new-design-modal/details-form";
import { useUploadContext } from "./upload-context";
import { useEffect } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import { queryClient } from "@/components/dashboard-providers";
import type { InfiniteDesignsResponse } from "@/app/api/designs/route";

export default function EditDesignSheet() {
	const [design, setDesign] = useQueryState("design", parseAsString);

	const { setEditDesignDetails } = useUploadContext();

	useEffect(() => {
		if (design && setEditDesignDetails) {
			// get the design details from the react-query cache
			const allDesigns:
				| InfiniteData<InfiniteDesignsResponse, unknown>
				| undefined = queryClient.getQueryData(["designs"]);

			const designDetails = allDesigns?.pages
				.flatMap((page) => page.designs)
				.find((d) => d.id === design);

			if (designDetails) {
				setEditDesignDetails(designDetails);
			}
		}
	}, [design, setEditDesignDetails]);

	return (
		<Sheet
			open={!!design}
			onOpenChange={(v) => {
				setDesign(v ? design : null);
			}}
		>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Edit Design</SheetTitle>
					<DetailsForm />
				</SheetHeader>
			</SheetContent>
		</Sheet>
	);
}
