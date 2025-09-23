import CreatorNav from "@/components/studios/CreatorNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "SignFlix - Creator Dashboard",
	description:
		"An accessible video streaming platform with integrated sign language interpretation for the deaf and hard-of-hearing community.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-background">
			<CreatorNav />
			<main className="mt-14 md:mt-0 md:ml-64 p-4 md:p-8">
				{children}
			</main>
		</div>
	);
}