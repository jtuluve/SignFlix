import Subscriptions from '@/components/subscriptions/Subscriptions'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscriptions - SignFlix",
  description: "Manage your channel subscriptions on SignFlix, an accessible video streaming platform with sign language interpretation.",
  keywords: ["SignFlix", "subscriptions", "channels", "follow", "accessible video", "sign language"],
  openGraph: {
    title: "Subscriptions - SignFlix",
    description: "Manage your channel subscriptions on SignFlix, an accessible video streaming platform with sign language interpretation.",
    images: [
      {
        url: "/placeholder-logo.png", 
        alt: "SignFlix Subscriptions",
      },
    ],
    siteName: "SignFlix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subscriptions - SignFlix",
    description: "Manage your channel subscriptions on SignFlix, an accessible video streaming platform with sign language interpretation.",
    images: ["/placeholder-logo.png"],
  },
};

const page = () => {
  return (
    <div>
      <Subscriptions />
    </div>
  )
}

export default page
