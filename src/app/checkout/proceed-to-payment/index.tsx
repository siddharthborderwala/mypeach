"use client";

import { checkoutAction } from "@/lib/actions/checkout";
import { ProceedToPaymentButton } from "./button";
import { checkout } from "@/lib/checkout";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import type { User } from "@prisma/client";

export function ProceedToPaymentForm({
	cartId,
	className,
}: {
	cartId: number;
	className?: string;
}) {
	const router = useRouter();

	const [phone, setPhone] = useState("");
	const [name, setName] = useState("");
	const [phoneError, setPhoneError] = useState("");
	const [nameError, setNameError] = useState("");

	const { data: userData, isLoading: isLoadingUserData } = useQuery({
		queryKey: ["user"],
		queryFn: async () => {
			const user: User = await fetch("/api/user").then((res) => res.json());
			if (!user) {
				throw new Error("User not found");
			}
			return user;
		},
		refetchOnWindowFocus: false,
	});

	const { mutate, isPending } = useMutation({
		mutationFn: () => {
			return fetch("/api/user", {
				method: "PUT",
				body: JSON.stringify({
					name,
					phone,
				}),
			});
		},
	});

	useEffect(() => {
		if (userData?.name) {
			setName(userData.name);
		}
	}, [userData?.name]);

	useEffect(() => {
		if (userData?.phone) {
			setPhone(userData.phone);
		}
	}, [userData?.phone]);

	return (
		<form
			className={className}
			action={async () => {
				if (!userData?.phone || !userData?.name) {
					if (!name) {
						setNameError("Name is required");
					} else {
						setNameError("");
					}

					if (!phone) {
						setPhoneError("Phone number is required");
					} else {
						setPhoneError("");
					}
				}

				try {
					mutate();

					toast.error("Sorry, we are not accepting orders right now");

					// const allOK = await checkoutAction();

					// if (!allOK) {
					// 	return;
					// }

					// const response = await checkout({
					// 	cartId,
					// 	phone,
					// 	// adding name here as well in case the mutate hasn't finished yet
					// 	name,
					// });

					// if (response.success) {
					// 	router.push(`/order?orderId=${response.data.orderId}`);
					// }
				} catch (error) {
					toast.error("Sorry, we couldn't process your order", {
						dismissible: true,
					});
				}
			}}
		>
			{(!userData?.phone || !userData?.name) && !isLoadingUserData && (
				<div className="mb-5">
					<div className="mb-3">
						<Label htmlFor="name" className="">
							Name
						</Label>
						<Input
							name="name"
							id="name"
							required
							className="mt-2 font-normal"
							placeholder="Sailesh Kumar"
							value={name}
							onChange={(e) => {
								setName(e.target.value);
								setNameError("");
							}}
						/>
						{nameError && (
							<p className="text-red-500 text-sm mt-2">{nameError}</p>
						)}
					</div>
					<div>
						<Label htmlFor="phone" className="">
							Phone Number
						</Label>
						<div className="flex items-center mt-2">
							<div className="rounded-md rounded-r-none px-2 shadow-sm self-stretch flex items-center justify-center border bg-slate-100">
								+91
							</div>
							<Input
								required
								value={phone}
								type="tel"
								placeholder="8123456789"
								onChange={(e) => {
									// remove '+91' from the phone number
									const value = e.target.value.replace("+91", "");
									setPhone(value);
									setPhoneError("");
								}}
								name="Phone"
								id="Phone"
								className="border-l-0 rounded-l-none font-normal"
							/>
						</div>
						{phoneError && (
							<p className="text-red-500 text-sm mt-2">{phoneError}</p>
						)}
					</div>
				</div>
			)}

			<ProceedToPaymentButton
				className={`${!userData?.name || !userData?.phone ? "max-sm:h-fit" : ""}`}
			/>
		</form>
	);
}
