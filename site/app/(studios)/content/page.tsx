import VideosSection from '@/components/studios/sections/VideosSection'
import React from 'react'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content - SignFlix Studio",
  description: "Manage your uploaded videos on SignFlix Studio.",
  keywords: ["SignFlix Studio", "video content", "manage videos", "creator dashboard", "uploaded videos"],
  openGraph: {
    title: "Content - SignFlix Studio",
    description: "Manage your uploaded videos on SignFlix Studio.",
    url: "https://signflix.svst.in/content",
    siteName: "SignFlix Studio",
    type: "website",
  },
};

const page = () => {
  return (
    <VideosSection />
  )
}

export default page
