"use client";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Spinner } from "../spinner";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { CheckCircle } from "@phosphor-icons/react";

export function VendorForm({
	data,
}: {
	data?: {
		vendorId?: number;
		name?: string;
		phone?: string;
		email?: string;
		vpa?: string;
		accountHolder?: string;
		pan?: string;
		status?: string;
	};
}) {
	const [phone, setPhone] = useState(data?.phone ?? "");
	const [vpa, setVpa] = useState(data?.vpa ?? "");
	const [accountHolder, setAccountHolder] = useState(data?.accountHolder ?? "");
	const [pan, setPan] = useState(data?.pan ?? "");
	const [isLoading, setIsLoading] = useState(false);

	const { mutateAsync: createVendorProfile, error: createVendorProfileError } =
		useMutation({
			mutationKey: ["create-vendor-profile"],
			mutationFn: ({
				phone,
				upi,
				kyc,
			}: {
				phone: string;
				upi: { vpa: string; accountHolder: string };
				kyc: { pan: string };
			}) => {
				return fetch("/api/vendor", {
					method: "POST",
					body: JSON.stringify({
						phone,
						upi,
						kyc,
					}),
				});
			},
			onSuccess: () => {
				toast.success(
					<div className="flex items-start w-full">
						<CheckCircle weight="bold" size={24} className="mr-2" />
						<div className="w-full">
							<p className="font-bold text-lg break-words">
								Created vendor profile
							</p>
							<p className="text-sm text-gray-500 mt-1">
								Your profile has been created.
							</p>
						</div>
					</div>,
					{
						id: "vendor-profile-created",
						position: "bottom-left",
					},
				);

				setTimeout(() => {
					// Refresh the page to reflect the changes
					window.location.reload();
				}, 1500);
			},
		});

	const getName = () => {
		if (isLoading) {
			return (
				<>
					<Spinner />
					<span>Creating...</span>
				</>
			);
		}

		return "Create Profile";
	};

	const getStatusName = () => {
		switch (data?.status) {
			case "ACTIVE":
				return "Active";
			case "BLOCKED":
				return "Blocked";
			case "DELETED":
				return "Deleted";
			case "IN_BENE_CREATION":
				return "In Process";
			case "ACTION_REQUIRED":
				return "Action Required";
			case "BANK_VALIDATION_FAILED":
				return "Bank Validation Failed";
			default:
				return "Unknown";
		}
	};

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={async (e) => {
				e.preventDefault();

				setIsLoading(true);

				// Verify the UPI

				await createVendorProfile({
					phone,
					upi: { vpa, accountHolder },
					kyc: { pan },
				});
			}}
		>
			<div>
				{data != null && (
					<div className="mb-2">
						<Label htmlFor="AccountStatus" className="">
							Account Status
						</Label>
						<div className="flex items-center">
							{/* add a dot of different colors which is either green, yellow, or red */}
							<div
								className={`w-3 h-3 rounded-full mr-2 ${
									data.status === "ACTIVE"
										? "bg-green-500"
										: data.status === "BLOCKED" || data.status === "DELETED"
											? "bg-red-500"
											: "bg-yellow-500"
								}`}
							/>
							<div
								className={`rounded-md text-xs tracking-wide px-4 py-2 uppercase 
								${
									data.status === "ACTIVE"
										? "bg-green-100 text-green-800"
										: data.status === "BLOCKED" || data.status === "DELETED"
											? "bg-red-100 text-red-800"
											: "bg-yellow-100 text-yellow-800"
								}
								`}
							>
								{getStatusName()}
							</div>
						</div>
					</div>
				)}

				<Label htmlFor="Phone" className="peer-data-[error=true]:text-red-500">
					Phone Number
				</Label>
				<div className="flex items-center">
					<div className="rounded-md text-sm rounded-r-none px-2 shadow-sm py-[0.43rem] border bg-slate-100">
						+91
					</div>
					<Input
						required
						value={phone}
						placeholder="8123456789"
						disabled={data != null}
						onChange={(e) => {
							// remove '+91' from the phone number
							const value = e.target.value.replace("+91", "");
							setPhone(value);
						}}
						name="Phone"
						id="Phone"
						className="border-l-0 rounded-l-none"
						style={{
							maxWidth: data != null ? "21.5rem" : "100%",
						}}
					/>
				</div>
			</div>

			<div>
				<Label htmlFor="UPI" className="peer-data-[error=true]:text-red-500">
					UPI ID
				</Label>

				<Input
					required
					value={vpa}
					disabled={data != null}
					placeholder="test@upi"
					onChange={(e) => setVpa(e.target.value)}
					name="UPI"
					id="UPI"
				/>
			</div>

			<div>
				<Label
					htmlFor="AccountHolder"
					className="peer-data-[error=true]:text-red-500"
				>
					PAN Account Name
				</Label>
				<Input
					required
					value={accountHolder}
					disabled={data != null}
					placeholder="Suresh Kumar Yadav"
					onChange={(e) => setAccountHolder(e.target.value)}
					name="AccountHolder"
					id="AccountHolder"
				/>
			</div>

			<div>
				<Label htmlFor="PAN" className="peer-data-[error=true]:text-red-500">
					PAN Number
				</Label>
				<Input
					required
					value={pan}
					disabled={data != null}
					placeholder="ABCDE1234F"
					onChange={(e) => setPan(e.target.value)}
					name="AccountHolder"
					id="AccountHolder"
				/>
			</div>

			{createVendorProfileError ? (
				<p className="text-red-500 text-sm font-medium">
					{createVendorProfileError?.message}
				</p>
			) : null}

			{data != null && (
				<div>
					{data.status !== "IN_BENE_CREATION" ? (
						<p className="text-muted-foreground mt-2">
							To update your vendor profile, please contact{" "}
							<a href="/support" className="text-primary/90 underline">
								support.
							</a>
						</p>
					) : (
						<p className="text-muted-foreground mt-2">
							Your profile is in the process of being created. It could take up
							to 24 hours.
							<br />
							If you have any questions, please contact{" "}
							<a href="/support" className="text-primary/90 underline">
								support.
							</a>
							.
						</p>
					)}
				</div>
			)}

			{data == null && (
				<Button
					type="submit"
					className={`gap-2${data != null ? " w-fit" : ""}`}
					disabled={isLoading}
				>
					{getName()}
				</Button>
			)}
		</form>
	);
}
