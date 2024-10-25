import { useMutation } from "@tanstack/react-query";
import type { ExploreDesign } from "../pages/home/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { createCollection } from "@/lib/actions/collections";
import { useState } from "react";
import { Button } from "../ui/button";
import { Spinner } from "../spinner";
import { queryClient } from "@/app/global-query-client";
import { toast } from "sonner";

export function NewCollectionModal({
	open,
	onOpenChange,
	firstDesign,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	firstDesign: Pick<ExploreDesign, "id" | "name">;
}) {
	const [collectionName, setCollectionName] = useState("");

	const designId = firstDesign.id;

	const {
		mutate: createCollectionFn,
		isPending: isCreatingCollection,
		error,
	} = useMutation({
		mutationKey: ["create-collection", designId],
		mutationFn: (collectionName: string) =>
			createCollection(collectionName, designId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["collections"],
			});
			queryClient.invalidateQueries({
				queryKey: ["collections-in-which-design-is", designId],
			});
			setCollectionName("");
			onOpenChange(false);
			toast.success("Collection created");
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>Create collection</DialogTitle>
				</DialogHeader>
				<form
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault();
						createCollectionFn(collectionName);
					}}
				>
					<Input
						required
						value={collectionName}
						placeholder="Collection name"
						onChange={(e) => setCollectionName(e.target.value)}
					/>
					{error ? (
						<p className="text-red-500 text-sm font-medium">{error.message}</p>
					) : null}
					<Button
						type="submit"
						className="gap-2"
						disabled={isCreatingCollection}
					>
						{isCreatingCollection ? (
							<>
								<Spinner />
								<span>Creating...</span>
							</>
						) : (
							"Create"
						)}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
