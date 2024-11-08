import type { Metadata } from "next";
import { BasicDetailsForm } from "./basic-details-form";
import { getBasicUserDetails } from "@/lib/actions/users";
import { UpdatePasswordForm } from "./update-password-form";
import { DeleteAccountForm } from "./delete-account-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { PayoutsForm } from "./payouts-form";

export const metadata: Metadata = {
	title: "Account Settings | Peach",
};

const searchParamsSchema = z.object({
	tab: z.enum(["account", "password"]).optional().default("account"),
});

export default async function Settings({
	searchParams,
}: {
	searchParams: { tab?: string };
}) {
	const user = await getBasicUserDetails();

	const result = searchParamsSchema.safeParse(searchParams);
	const initialTab = result.success ? result.data.tab : "account";

	if ("error" in user) {
		return <div>{user.error}</div>;
	}

	return (
		<main className="relative flex h-[calc(100svh-3.5rem)] flex-col">
			<div className="flex items-center justify-between pt-4 px-4 md:pt-8 md:px-8">
				<h1 className="text-lg font-semibold md:text-2xl">Account Settings</h1>
			</div>
			<Tabs
				defaultValue={initialTab}
				className="pb-4 px-4 md:pb-8 md:px-8 mt-6 flex items-start gap-8 overflow-y-auto flex-1"
				orientation="vertical"
			>
				<TabsList className="sticky left-0 top-0 flex flex-col h-auto">
					<TabsTrigger value="account" className="px-16 py-2">
						Account
					</TabsTrigger>
					<TabsTrigger value="password" className="px-16 py-2">
						Password
					</TabsTrigger>
					<TabsTrigger value="payouts" className="px-16 py-2">
						Payouts
					</TabsTrigger>
				</TabsList>
				<TabsContent value="account" className="p-0 mt-0 w-full">
					<h3 className="text-lg font-semibold mb-4">Basic Details</h3>
					<BasicDetailsForm initialData={user} />
					<hr className="my-8" />
					<h3 className="text-lg font-semibold mb-4">Danger Zone</h3>
					<p className="text-sm text-muted-foreground mb-4">
						Deleting your account is irreversible and will remove all of your
						data from our systems. Your account cannot be recovered once
						deleted.
					</p>
					<DeleteAccountForm />
				</TabsContent>
				<TabsContent value="password" className="p-0 mt-0 w-full">
					<h3 className="text-lg font-semibold mb-4">Update Password</h3>
					<UpdatePasswordForm />
				</TabsContent>
				<TabsContent value="payouts" className="p-0 mt-0 w-full">
					<h3 className="text-lg font-semibold mb-4">Payouts</h3>
					<PayoutsForm />
				</TabsContent>
			</Tabs>
		</main>
	);
}
