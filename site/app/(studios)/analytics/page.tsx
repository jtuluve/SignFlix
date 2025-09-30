import AnalyticsSection from '@/components/studios/sections/AnalyticsSection'
import React from 'react'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics - SignFlix Studio",
  description: "View your video analytics and performance on SignFlix Studio.",
  keywords: ["SignFlix Studio", "analytics", "video performance", "channel insights", "creator dashboard"],
  openGraph: {
    title: "Analytics - SignFlix Studio",
    description: "View your video analytics and performance on SignFlix Studio.",
    url: "https://signflix.svst.in/analytics",
    siteName: "SignFlix Studio",
    type: "website",
  },
};

const page = () => {
  return (
    <AnalyticsSection />
  )
}

export default page
