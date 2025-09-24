import UploadSection from '@/components/studios/sections/UploadSection'
import React from 'react'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Video - SignFlix Studio",
  description: "Upload new videos to your SignFlix Studio channel.",
};

const page = () => {
  return (
    <UploadSection />
  )
}

export default page
