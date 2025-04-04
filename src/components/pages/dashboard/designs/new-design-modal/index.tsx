"use client";

import { ErrorCode, useDropzone } from "react-dropzone";
import { generateId } from "lucia";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn, MB } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { getDesignFileStorageKey } from "@/lib/storage/util";
import { DetailsForm } from "./details-form";
import { Spinner } from "@/components/spinner";
import { TiffPreview } from "./tiff-preview";
import { useUploadContext } from "../upload-context";
import { useRefetchDesigns } from "@/hooks/dashboard";
import Separator from "@/components/ui/separator";

type UploadState =
	| {
			state: "idle";
	  }
	| {
			fileName: string;
			state: "uploading";
			progress: number;
	  }
	| {
			fileName: string;
			state: "complete";
	  }
	| {
			fileName: string;
			state: "error";
			error: string;
	  };

function getFileNameWithoutExtension(fileName: string) {
	return fileName.split(".").slice(0, -1).join(".");
}

export function NewDesignModal() {
	const {
		setNewDesignId,
		reset,
		setNewDesignIsCreatedInDb,
		setNewDesignIsUploaded,
		newDesignIsUploaded,
		newDesignId,
		newDesignIsCreatedInDb,
	} = useUploadContext();

	const refetchDesigns = useRefetchDesigns();

	const toastId = useRef<string | number>();
	const [uploadState, setUploadState] = useState<UploadState>({
		state: "idle",
	});
	const resetAfterUpload = useRef(false);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			const file = acceptedFiles[0];

			if (!file) {
				return;
			}

			const newDesignId = generateId(36);
			const newDesignFileId = generateId(36);

			setNewDesignId(newDesignId);

			setUploadState({
				state: "uploading",
				fileName: file.name,
				progress: 0,
			});

			const res = await fetch("/api/get-presigned-url", {
				method: "POST",
				body: JSON.stringify({
					fileType: file.type,
					storageKey: getDesignFileStorageKey(newDesignFileId),
				}),
			});

			if (res.status !== 200) {
				setUploadState({
					state: "error",
					fileName: file.name,
					error: "Failed to start upload",
				});
				setTimeout(() => {
					reset();
					setUploadState({
						state: "idle",
					});
				}, 5000);
				return;
			}

			const { presignedUrl } = await res.json();

			const worker = new Worker(new URL("./upload-worker.js", import.meta.url));

			worker.onmessage = (event) => {
				switch (event.data.type) {
					case "start":
						setUploadState({
							state: "uploading",
							fileName: file.name,
							progress: 0,
						});
						fetch("/api/designs", {
							method: "POST",
							body: JSON.stringify({
								designId: newDesignId,
								fileId: newDesignFileId,
								fileName: file.name,
								fileType: file.type,
							}),
						})
							.then((res) => {
								if (res.status !== 200) {
									throw new Error("Failed to create new design");
								}
								return res.json();
							})
							.then(() => {
								setNewDesignIsCreatedInDb(true);
								refetchDesigns();
							})
							.catch((error) => {
								worker.postMessage({
									type: "cancelUpload",
									reason: error.message,
								});
							});
						break;
					case "progress":
						setUploadState({
							state: "uploading",
							fileName: file.name,
							progress: event.data.progress,
						});
						break;
					case "complete":
						setUploadState({
							state: "complete",
							fileName: file.name,
						});
						fetch("/api/designs/is-upload-complete", {
							method: "POST",
							body: JSON.stringify({
								designId: newDesignId,
								isUploadComplete: true,
							}),
						});
						setNewDesignIsUploaded(true);
						worker.terminate();
						break;
					case "error":
					case "cancelled":
						setUploadState({
							state: "error",
							fileName: file.name,
							error: event.data.message,
						});
						setTimeout(() => {
							reset();
							setUploadState({
								state: "idle",
							});
						}, 5000);
						worker.terminate();
						break;
				}
			};

			// Start the upload
			worker.postMessage({
				type: "upload",
				file,
				presignedUrl,
			});
		},
		[
			reset,
			setNewDesignId,
			setNewDesignIsCreatedInDb,
			setNewDesignIsUploaded,
			refetchDesigns,
		],
	);

	const { getRootProps, getInputProps, isDragActive, acceptedFiles, open } =
		useDropzone({
			onDrop,
			autoFocus: true,
			multiple: false,
			accept: { "image/tiff": [".tif", ".tiff"] },
			minSize: MB(5),
			maxSize: MB(2400),
			disabled: uploadState.state !== "idle",
			onDropRejected: (fileRejections) => {
				const error = fileRejections[0]?.errors[0];
				if (error.code) {
					switch (error.code) {
						case ErrorCode.FileInvalidType:
							toast.error("You can only upload TIFF files.");
							break;
						case ErrorCode.FileTooLarge:
							toast.error(
								"You can only upload files up to 2400MB. Please try a smaller file.",
							);
							break;
						case ErrorCode.FileTooSmall:
							toast.error(
								"The file is too small. The minimum size is 5MB. Please try a larger file.",
							);
							break;
						case ErrorCode.TooManyFiles:
							toast.error("You can only upload one file at a time.");
							break;
					}
				} else {
					toast.error(error.message);
				}
			},
		});

	useEffect(() => {
		if (uploadState.state === "idle") {
			toastId.current = undefined;
		}
		if (uploadState.state === "complete") {
			toast.success(
				<div className="flex items-start w-full">
					<CheckCircle weight="bold" size={24} className="mr-2" />
					<div className="w-full">
						<p className="font-bold text-lg break-words">
							Uploaded {uploadState.fileName}
						</p>
						<p className="text-sm text-gray-500 mt-1">
							Your design has been saved.
						</p>
					</div>
				</div>,
				{
					id: toastId.current,
					position: "bottom-left",
				},
			);
		}
		if (uploadState.state === "error") {
			toast.error(
				<div className="flex items-start w-full">
					<WarningCircle weight="bold" size={24} className="mr-2" />
					<div className="w-full">
						<p className="font-bold text-lg break-words">
							Upload failed for {uploadState.fileName}
						</p>
						<p className="text-sm text-gray-500 mt-1">{uploadState.error}</p>
					</div>
				</div>,
				{
					id: toastId.current,
					position: "bottom-left",
				},
			);
			toastId.current = undefined;
		}
	}, [uploadState]);

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (uploadState.state === "uploading") {
				e.preventDefault();
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [uploadState.state]);

	const completeSaveAndReset = () => {
		if (newDesignIsUploaded && uploadState.state === "complete") {
			setUploadState({
				state: "idle",
			});
			reset();
		} else {
			resetAfterUpload.current = true;
		}
	};

	useEffect(() => {
		if (
			resetAfterUpload.current &&
			newDesignIsUploaded &&
			uploadState.state === "complete"
		) {
			setUploadState({
				state: "idle",
			});
			reset();
		}
	}, [newDesignIsUploaded, uploadState, reset]);

	return (
		<DialogContent
			className="w-full max-w-2xl"
			onInteractOutside={(e) => {
				if (
					uploadState.state === "uploading" ||
					uploadState.state === "complete"
				) {
					e.preventDefault();
				}
			}}
			isCloseButtonHidden={
				uploadState.state === "uploading" || uploadState.state === "complete"
			}
		>
			<DialogHeader>
				<DialogTitle>
					{uploadState.state === "idle"
						? "Add New Design"
						: `Creating ${getFileNameWithoutExtension(uploadState.fileName)}`}
				</DialogTitle>
			</DialogHeader>
			{uploadState.state === "idle" || uploadState.state === "error" ? (
				<div
					{...getRootProps()}
					className={cn(
						"h-80 border border-gray-300 border-dashed rounded-lg p-4 flex flex-col items-center justify-center",
						isDragActive ? "bg-primary/10" : "",
					)}
				>
					<p className="font-bold">Drag and drop a TIFF file</p>
					<p className="text-sm text-gray-500 mt-1">
						Minimum size: 5MB, Maximum size: 2.4GB
					</p>
					<Button className="mt-4">
						<input {...getInputProps()} />
						Select File
					</Button>
				</div>
			) : null}
			{uploadState.state === "uploading" || uploadState.state === "complete" ? (
				<>
					<div className="min-h-80 grid grid-cols-[1fr_1fr] gap-4">
						{newDesignIsCreatedInDb ? (
							<>
								{newDesignId ? (
									<DetailsForm onSave={completeSaveAndReset} />
								) : null}
							</>
						) : (
							<div className="w-full h-full flex flex-col items-center justify-center">
								<Spinner />
								<p className="font-bold">Creating your design...</p>
							</div>
						)}
						<div className="w-full h-auto flex items-center justify-center">
							<TiffPreview file={acceptedFiles[0]} />
						</div>
					</div>
					{uploadState.state === "uploading" && (
						<>
							<Separator />
							<div className="w-full">
								<p className="font-bold text-lg break-words">
									Uploading {uploadState.fileName}
								</p>
								<p className="text-xs text-gray-500 mt-1">
									Please do not close this window or refresh the page.
								</p>
								<Progress className="mt-3" value={uploadState.progress} />
							</div>
						</>
					)}
				</>
			) : null}
		</DialogContent>
	);
}
