"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/spinner";
import { FormError } from "@/components/form-error";
import { toast } from "sonner";
import { useUploadContext } from "../upload-context";
import { useRefetchDesigns } from "@/hooks/dashboard";

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	price: z.number().min(290, "Price must be at least 290"),
	fileDPI: z.number().min(300, "File DPI must be at least 300"),
	tags: z.string().optional(),
	designId: z.string(),
});

export function DetailsForm({
	className,
}: {
	className?: string;
}) {
	const [formState, setFormState] = useState<
		| {
				state: "idle" | "loading" | "success";
		  }
		| {
				state: "error";
				error: string;
		  }
	>({
		state: "idle",
	});

	const { newDesignId, newDesignDetails, setNewDesignDetails } =
		useUploadContext();

	const refetchDesigns = useRefetchDesigns();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			designId: newDesignId,
			name: newDesignDetails?.name ?? "Untitled",
			price: newDesignDetails?.price ?? 290,
			fileDPI: newDesignDetails?.fileDPI ?? 300,
			tags: newDesignDetails?.tags ?? "",
		},
	});

	const onSubmit = useCallback(
		async (values: z.infer<typeof formSchema>) => {
			setFormState({ state: "loading" });
			const response = await fetch("/api/designs", {
				method: "PUT",
				body: JSON.stringify(values),
			});
			if (!response.ok) {
				const error = await response.json();
				setFormState({ state: "error", error: error.message });
				return;
			}
			const data = await response.json();
			setFormState({ state: "success" });
			toast.success("Design details saved", {
				duration: 3000,
			});
			setNewDesignDetails(data.design);
			refetchDesigns();
			setTimeout(() => {
				setFormState({ state: "idle" });
			}, 1000);
		},
		[setNewDesignDetails, refetchDesigns],
	);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className={cn("space-y-4", className)}
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-bold">Name</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="price"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-bold">Price (INR)</FormLabel>
							<FormControl>
								<Input
									type="number"
									{...field}
									onChange={(e) => field.onChange(Number(e.target.value))}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="fileDPI"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-bold">File DPI</FormLabel>
							<FormControl>
								<Input
									type="number"
									{...field}
									onChange={(e) => field.onChange(Number(e.target.value))}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="tags"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="font-bold">
								Tags (comma separated)
							</FormLabel>
							<FormControl>
								<Textarea rows={4} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{formState.state === "error" ? (
					<FormError state={{ error: formState.error }} />
				) : null}
				<Button
					type="submit"
					disabled={formState.state === "loading"}
					className="w-full"
				>
					{formState.state === "loading" ? <Spinner className="mr-2" /> : null}
					{formState.state === "loading" ? "Saving..." : null}
					{formState.state === "idle" ? "Save" : null}
					{formState.state === "success" ? "Saved" : null}
				</Button>
			</form>
		</Form>
	);
}
