"use client"

import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreatorNav() {
  return (
    <TabsList className="grid w-full grid-cols-4 max-w-md">
      <TabsTrigger className='cursor-pointer' value="upload">Upload</TabsTrigger>
      <TabsTrigger className='cursor-pointer' value="videos">My Videos</TabsTrigger>
      <TabsTrigger className='cursor-pointer' value="analytics">Analytics</TabsTrigger>
      <TabsTrigger className='cursor-pointer' value="profile">Profile</TabsTrigger>
    </TabsList>
  );
}
