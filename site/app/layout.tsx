import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import SessionProviderWrapper from "@/components/sessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "SignFlix - Video Streaming with Sign Language",
	description:
		"An accessible video streaming platform with integrated sign language interpretation for the deaf and hard-of-hearing community.",
	keywords: ["SignFlix", "sign language", "ASL", "BSL", "video streaming", "accessible video", "Deaf community", "hard of hearing", "sign language interpretation", "online video"],
	openGraph: {
		title: "SignFlix - Video Streaming with Sign Language",
		description:
			"An accessible video streaming platform with integrated sign language interpretation for the deaf and hard-of-hearing community.",
		url: "https://signflix.svst.in",
		siteName: "SignFlix",
		type: "website",
		images: [
			{
				url: "/placeholder-logo.png",
				alt: "SignFlix Logo",
			},
		],
	},
	icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession();
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
			</head>
			<SessionProviderWrapper session={session}>	
				<body className={inter.className}>{children}</body>
			</SessionProviderWrapper>
		</html>
	);
}
