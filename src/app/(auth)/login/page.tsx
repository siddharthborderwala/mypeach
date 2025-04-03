import type { Metadata } from "next";
import { LoginForm } from "./form";

export const metadata: Metadata = {
	title: "Login | Peach",
	description:
		"Login to Peach - the platform for buying and selling latest TIFF layered textile design files.",
};

export default function Login() {
	return (
		<div className="flex items-center justify-center py-12 px-4 w-full h-full">
			<LoginForm />
		</div>
	);
}
