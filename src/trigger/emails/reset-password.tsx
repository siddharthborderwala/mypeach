import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import * as React from "react";
import stripIndent from "strip-indent";
import { appBaseURL } from "./util";

interface ResetPasswordProps {
	token?: string;
}

const ResetPasswordComponent = ({ token }: ResetPasswordProps) => {
	const resetURL = `${appBaseURL}/reset-password?token=${token}`;

	return (
		<Html>
			<Head />
			<Preview>Reset your password for Peach</Preview>
			<Body style={main}>
				<Container style={container}>
					<Img
						src={`${appBaseURL}/logo.png`}
						width="42"
						height="42"
						alt="Peach"
						style={logo}
					/>
					<Heading style={heading}>Reset your password for Peach</Heading>
					<Text style={paragraph}>
						We received a request to reset your password. If you didn't make
						this request, you can safely ignore this email.
					</Text>
					<Section style={buttonContainer}>
						<Button style={button} href={resetURL}>
							Reset Password
						</Button>
					</Section>
					<Text style={paragraph}>
						This link will only be valid for the next 60 minutes. If the button
						doesn't work, you can copy and paste the following URL into your
						browser:
					</Text>
					<Text
						style={{
							...link,
							display: "block",
							marginBottom: "16px",
						}}
					>
						{resetURL}
					</Text>
					<Hr style={hr} />
					<Link href={appBaseURL} style={reportLink}>
						Peach
					</Link>
				</Container>
			</Body>
		</Html>
	);
};

const resetPasswordText = ({ token }: ResetPasswordProps) => {
	const resetURL = `${appBaseURL}/reset-password?token=${token}`;

	return stripIndent(`
		Reset your password for Peach

		We received a request to reset your password. If you didn't make this request, you can safely ignore this email.

		${resetURL}

		This link will only be valid for the next 60 minutes.

		Peach
    ${appBaseURL}
	`);
};

const ResetPassword = {
	react: ResetPasswordComponent,
	text: resetPasswordText,
};

export default ResetPassword;

const logo = {
	borderRadius: 21,
	width: 42,
	height: 42,
};

const main = {
	backgroundColor: "#ffffff",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
	margin: "0 auto",
	padding: "20px 0 48px",
	maxWidth: "560px",
};

const heading = {
	fontSize: "24px",
	letterSpacing: "-0.5px",
	lineHeight: "1.3",
	fontWeight: "400",
	color: "#484848",
	padding: "17px 0 0",
};

const paragraph = {
	margin: "0 0 15px",
	fontSize: "15px",
	lineHeight: "1.4",
	color: "#3c4149",
};

const buttonContainer = {
	padding: "27px 0 27px",
};

const button = {
	backgroundColor: "#FB6F84",
	borderRadius: "3px",
	fontWeight: "600",
	color: "#fff",
	fontSize: "15px",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "block",
	padding: "11px 23px",
};

const reportLink = {
	fontSize: "14px",
	color: "#b4becc",
};

const hr = {
	borderColor: "#dfe1e4",
	margin: "42px 0 26px",
};

const code = {
	fontFamily: "monospace",
	fontWeight: "700",
	padding: "1px 4px",
	backgroundColor: "#dfe1e4",
	letterSpacing: "-0.3px",
	fontSize: "21px",
	borderRadius: "4px",
	color: "#3c4149",
};

const link = {
	color: "#2754C5",
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: "14px",
	textDecoration: "underline",
};
