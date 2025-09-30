"use client";

import CreatorNav from "@/components/studios/CreatorNav";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { data: session, status } = useSession();

	if (status === "unauthenticated") {
		redirect("/signin");
	}

	return (
		<div className="min-h-screen bg-background">
			<CreatorNav />
			<main className="mt-14 md:mt-0 md:ml-64 p-4 md:p-8">
				{children}
			</main>
		</div>
	);
}