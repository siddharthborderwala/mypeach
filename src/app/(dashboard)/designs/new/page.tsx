import { getPresignedUrl } from "@/lib/actions/storage";
import { generateId } from "lucia";

export default async function NewDesignPage() {
	const fileId = generateId(24);

	const [tiffPresignedUrl, pngPresignedUrl] = await Promise.all([
		getPresignedUrl({
			fileName: `original-design-files/${fileId}.tiff`,
			fileType: "image/tiff",
		}),
		getPresignedUrl({
			fileName: `original-design-files/${fileId}.jpeg`,
			fileType: "image/jpeg",
		}),
	]);

	if (tiffPresignedUrl.isErr() || pngPresignedUrl.isErr()) {
		return (
			<div>
				<p>Error</p>
			</div>
		);
	}

	return (
		<main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
			<div className="flex items-center">
				<h1 className="text-lg font-semibold md:text-2xl">New Design</h1>
			</div>
			<div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
				<div className="flex flex-col items-center gap-1 text-center">
					<h3 className="text-2xl font-bold tracking-tight">
						You have no designs
					</h3>
					<p className="text-sm text-muted-foreground">
						You can start selling as soon as you add a design.
					</p>
				</div>
			</div>
		</main>
	);
}
