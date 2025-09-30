
import React from 'react';
import type { Metadata } from "next";
import Terms from '@/components/Terms';

export const metadata: Metadata = {
  title: "Terms and Conditions - SignFlix",
  description: "Read the Terms and Conditions for using SignFlix, an accessible video streaming platform with sign language interpretation.",
  keywords: ["SignFlix", "terms", "conditions", "legal", "privacy policy", "accessible video"],
  openGraph: {
    title: "Terms and Conditions - SignFlix",
    description: "Read the Terms and Conditions for using SignFlix, an accessible video streaming platform with sign language interpretation.",
    url: "https://signflix.svst.in/terms",
    siteName: "SignFlix",
    type: "website",
  },
};

const page = () => {
  return (
    <Terms />
  )
}

export default page;
