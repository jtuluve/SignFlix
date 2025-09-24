import Subscriptions from '@/components/subscriptions/Subscriptions'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscriptions - SignFlix",
  description: "Manage your channel subscriptions on SignFlix.",
  openGraph: {
    title: "Subscriptions - SignFlix",
    description: "Manage your channel subscriptions on SignFlix.",
    images: [
      {
        url: "/placeholder-logo.png", // Using a default placeholder logo
        alt: "SignFlix Subscriptions",
      },
    ],
    siteName: "SignFlix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subscriptions - SignFlix",
    description: "Manage your channel subscriptions on SignFlix.",
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
