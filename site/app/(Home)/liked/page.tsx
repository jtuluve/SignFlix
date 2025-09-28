import Library from "@/components/liked/Liked";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liked Videos - SignFlix",
  description: "View your liked videos on SignFlix.",
};

export default function Page() {
  return <Library />;
}