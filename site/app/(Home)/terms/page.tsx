
import React from 'react';
import type { Metadata } from "next";
import Terms from '@/components/Terms';

export const metadata: Metadata = {
  title: "Terms and Conditions - SignFlix",
  description: "Terms and Conditions for SignFlix.",
};

const page = () => {
  return (
    <Terms />
  )
}

export default page;
