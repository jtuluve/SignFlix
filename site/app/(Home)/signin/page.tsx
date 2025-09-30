import React from 'react'
import type { Metadata } from "next";
import SignIn from '@/components/SignIn';

export const metadata: Metadata = {
  title: "Sign In / Sign Up - SignFlix",
  description: "Sign in or create an account to access SignFlix features.",
  keywords: ["SignFlix", "sign in", "sign up", "login", "register", "account", "accessible video"],
  openGraph: {
    title: "Sign In / Sign Up - SignFlix",
    description: "Sign in or create an account to access SignFlix features.",
    images: [
      {
        url: "/placeholder-logo.png",
        alt: "SignFlix Authentication",
      },
    ],
    siteName: "SignFlix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In / Sign Up - SignFlix",
    description: "Sign in or create an account to access SignFlix features.",
    images: ["/placeholder-logo.png"],
  },
};

const page = () => {
  return (
    <SignIn/>
  )
}

export default page;