import Feed from '@/components/home/Feed'
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "SignFlix | Accessible Video Streaming with Sign Language Interpretation",
	description: "Explore a diverse library of videos with integrated sign language interpretation. SignFlix is dedicated to providing accessible content for the Deaf and hard-of-hearing community, featuring ASL, BSL, and more.",
	keywords: ["SignFlix", "sign language", "ASL", "BSL", "video streaming", "accessible video", "Deaf community", "hard of hearing", "sign language interpretation", "online video"],
};

const page = () => {
	return <Feed />;
}

export default page
