import type { Metadata } from "next";
import { RegisterForm } from "./form";

export const metadata: Metadata = {
	title: "Register | Peach",
	description:
		"Register at Peach - the platform for buying and selling latest TIFF layered textile design files.",
};

export default function Register() {
	return (
		<div className="flex items-center justify-center py-12 px-4 w-full h-full">
			<RegisterForm />
		</div>
	);
}
