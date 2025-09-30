import UploadSection from '@/components/studios/sections/UploadSection'
import React from 'react'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Video - SignFlix Studio",
  description: "Upload new videos to your SignFlix Studio channel.",
  keywords: ["SignFlix Studio", "upload video", "new video", "creator tools", "publish video"],
  openGraph: {
    title: "Upload Video - SignFlix Studio",
    description: "Upload new videos to your SignFlix Studio channel.",
    url: "https://signflix.svst.in/upload",
    siteName: "SignFlix Studio",
    type: "website",
  },
};

const page = () => {
  return (
    <UploadSection />
  )
}

export default page
