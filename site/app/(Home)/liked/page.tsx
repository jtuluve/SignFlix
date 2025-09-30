import Library from "@/components/liked/Liked";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liked Videos - SignFlix",
  description: "View your liked videos on SignFlix, an accessible video streaming platform with sign language interpretation.",
  keywords: ["SignFlix", "liked videos", "favorite videos", "sign language", "accessible video", "ASL", "BSL"],
  openGraph: {
    title: "Liked Videos - SignFlix",
    description: "View your liked videos on SignFlix, an accessible video streaming platform with sign language interpretation.",
    url: "https://signflix.svst.in/liked",
    siteName: "SignFlix",
    type: "website",
  },
};

export default function Page() {
  return <Library />;
}