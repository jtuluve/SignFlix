import ProfileSection from '@/components/studios/sections/ProfileSection'
import React from 'react'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - SignFlix Studio",
  description: "Manage your studio profile and settings on SignFlix Studio.",
  keywords: ["SignFlix Studio", "profile settings", "manage account", "creator profile", "channel settings"],
  openGraph: {
    title: "Profile - SignFlix Studio",
    description: "Manage your studio profile and settings on SignFlix Studio.",
    url: "https://signflix.svst.in/profile",
    siteName: "SignFlix Studio",
    type: "website",
  },
};

const page = () => {
  return (
    <ProfileSection />
  )
}

export default page
