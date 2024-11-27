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
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { toggleDesignPublish } from "@/lib/actions/designs";
import { queryClient } from "@/app/global-query-client";
import { Spinner } from "@/components/spinner";

const formatDate = (date: Date | string) => {
	return new Date(date).toLocaleDateString("en", {
		dateStyle: "long",
	});
};

const OtherDetails = ({
	editDesignDetails,
}: {
	editDesignDetails: NonNullable<
		ReturnType<typeof useUploadContext>["editDesignDetails"]
	>;
}) => {
	const { setEditDesignDetails } = useUploadContext();

	const { mutate: togglePublish, isPending } = useMutation({
		mutationKey: ["togglePublish", editDesignDetails.id],
		mutationFn: async () => {
			const result = await toggleDesignPublish(editDesignDetails.id);
			if (result.isErr()) {
				throw new Error(result.error);
			}
			return result.value;
		},
		onSuccess: (data) => {
			setEditDesignDetails(data);
			queryClient.invalidateQueries({ queryKey: ["designs"] });
			toast.success(
				editDesignDetails.isDraft ? "Design published" : "Design unpublished",
			);
		},
		onError: (e) => {
			toast.error(e.message);
		},
	});

	return (
		<div className="flex justify-between my-4">
			<div className="space-y-1">
				<p className="text-muted-foreground text-sm">
					Added on {formatDate(editDesignDetails.createdAt)}
				</p>
			</div>
			{editDesignDetails.isDraft ? (
				<Button
					variant="success"
					size="sm"
					onClick={() => togglePublish()}
					disabled={isPending}
					className="gap-2"
				>
					{isPending ? <Spinner size={14} className="animate-spin" /> : null}
					Publish
				</Button>
			) : (
				<Button
					variant="destructive"
					size="sm"
					onClick={() => togglePublish()}
					disabled={isPending}
					className="gap-2"
				>
					{isPending ? <Spinner size={14} className="animate-spin" /> : null}
					Unpublish
				</Button>
			)}
		</div>
	);
};

export default function EditDesignSheet() {
	const [design, setDesign] = useQueryState("design", parseAsString);

	const { editDesignDetails } = useUploadContext();

	return (
		<Sheet
			open={!!design}
			onOpenChange={(v) => {
				setDesign(v ? design : null);
			}}
		>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Design Details</SheetTitle>
				</SheetHeader>
				{editDesignDetails ? (
					<OtherDetails editDesignDetails={editDesignDetails} />
				) : null}
				<DetailsForm />
			</SheetContent>
		</Sheet>
	);
}
