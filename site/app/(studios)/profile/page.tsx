import ProfileSection from '@/components/studios/sections/ProfileSection'
import React from 'react'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - SignFlix Studio",
  description: "Manage your studio profile and settings on SignFlix Studio.",
};

const page = () => {
  return (
    <ProfileSection />
  )
}

export default page
