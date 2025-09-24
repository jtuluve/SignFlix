import AnalyticsSection from '@/components/studios/sections/AnalyticsSection'
import React from 'react'
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics - SignFlix Studio",
  description: "View your video analytics and performance on SignFlix Studio.",
};

const page = () => {
  return (
    <AnalyticsSection />
  )
}

export default page
