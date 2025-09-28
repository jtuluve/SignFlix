import VideosSection from '@/components/studios/sections/VideosSection'
import React from 'react'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content - SignFlix Studio",
  description: "Manage your uploaded videos on SignFlix Studio.",
};

const page = () => {
  return (
    <VideosSection />
  )
}

export default page
