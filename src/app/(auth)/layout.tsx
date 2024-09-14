import { AuthLayout } from "@/components/auth/auth-layout";
import { getUserAuth } from "@/lib/auth/utils";
import { redirect } from "next/navigation";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getUserAuth();

	if (session?.session) redirect("/");

	return <AuthLayout>{children}</AuthLayout>;
}
