"use client";
import { User } from "@phosphor-icons/react";
import { VendorOnboardingModal } from "../vendor-onboarding-modal";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import { useState } from "react";

export function VendorNotFound({
	title,
}: {
	title: string;
}) {
	return (
		<>
			<Dialog defaultOpen={true}>
				<main className="relative flex h-[calc(100svh-3.5rem)] flex-col gap-4 md:gap-6">
					<div className="flex items-center justify-between pt-4 px-4 md:pt-8 md:px-8">
						<h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
					</div>
					<div className="mb-4 mx-4 md:mb-8 md:mx-8 flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
						<div className="flex flex-col items-center gap-1 text-center">
							<User className="text-muted-foreground" size={48} />
							<h3 className="text-2xl font-bold tracking-tight mt-4">
								You need to create a vendor profile first
							</h3>
							<p className="text-sm text-muted-foreground">
								Create your vendor profile to start selling your designs!
							</p>
							<DialogTrigger asChild>
								<Button className="gap-2 mt-4">Create Vendor Profile</Button>
							</DialogTrigger>
						</div>
					</div>
				</main>
				<VendorOnboardingModal />
			</Dialog>
		</>
	);
}
