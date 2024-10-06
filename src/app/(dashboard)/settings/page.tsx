import { ScrollArea } from "@/components/ui/scroll-area";
import type { Metadata } from "next";
import { BasicDetailsForm } from "./basic-details-form";
import { getBasicUserDetails } from "@/lib/actions/users";
import { UpdatePasswordForm } from "./update-password-form";
import { DeleteAccountForm } from "./delete-account-form";

export const metadata: Metadata = {
	title: "Account Settings | Peach",
};

export default async function Settings() {
	const user = await getBasicUserDetails();

	if ("error" in user) {
		return <div>{user.error}</div>;
	}

	return (
		<main className="relative flex h-[calc(100svh-3.5rem)] flex-col">
			<div className="flex items-center justify-between pt-4 px-4 md:pt-8 md:px-8">
				<h1 className="text-lg font-semibold md:text-2xl">Account Settings</h1>
			</div>
			<ScrollArea className="mt-8">
				<div className="pb-4 px-4 md:pb-8 md:px-8">
					<h3 className="text-lg font-semibold mb-4">Basic Details</h3>
					<BasicDetailsForm initialData={user} />
					<hr className="my-8" />
					<h3 className="text-lg font-semibold mb-4">Update Password</h3>
					<UpdatePasswordForm />
					<hr className="my-8" />
					<h3 className="text-lg font-semibold mb-4">Danger Zone</h3>
					<DeleteAccountForm />
				</div>
			</ScrollArea>
		</main>
	);
}

/**
 * Account Settings
 *
 * show/edit
 * - name
 * - username
 * - email
 *
 * edit
 * - password
 *
 * danger zone
 * - delete account
 *
 */
