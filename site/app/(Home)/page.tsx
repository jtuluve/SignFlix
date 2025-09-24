import Feed from '@/components/home/Feed'
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Home - SignFlix",
	description: "Discover and watch videos with sign language interpretation on SignFlix.",
};

const page = () => {
	return <Feed />;
}

export default page
