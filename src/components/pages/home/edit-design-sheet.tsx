"use client";

import { parseAsString, useQueryState } from "nuqs";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "../../ui/sheet";

export default function EditDesignSheet() {
	const [design, setDesign] = useQueryState("design", parseAsString);

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
					<SheetDescription>
						This action cannot be undone. This will permanently delete your
						account and remove your data from our servers.
					</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	);
}
