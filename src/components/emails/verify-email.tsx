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

interface VerifyEmailProps {
	token?: string;
}

const VerifyEmailComponent = ({ token }: VerifyEmailProps) => {
	const verficiationURL = `${appBaseURL}/verify-email?code=${token}`;

	return (
		<Html>
			<Head />
			<Preview>Verify your email for Peach</Preview>
			<Body style={main}>
				<Container style={container}>
					<Img
						src={`${appBaseURL}/favicon.ico`}
						width="42"
						height="42"
						alt="Peach"
						style={logo}
					/>
					<Heading style={heading}>Verify your email for Peach</Heading>
					<Section style={buttonContainer}>
						<Button style={button} href={verficiationURL}>
							Verify your email
						</Button>
					</Section>
					<Text style={paragraph}>
						This link will only be valid for the next 24 hours. If the button
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
						{verficiationURL}
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

const verifyEmailText = ({ token }: VerifyEmailProps) => {
	const verificationURL = `${appBaseURL}/verify-email?code=${token}`;

	return stripIndent(`
    Verify your email for Peach

    Please verify your email by clicking the link below:
    ${verificationURL}

    This link will only be valid for the next 24 hours.

    Peach
    ${appBaseURL}
  `);
};

const VerifyEmail = {
	react: VerifyEmailComponent,
	text: verifyEmailText,
};

export default VerifyEmail;

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
