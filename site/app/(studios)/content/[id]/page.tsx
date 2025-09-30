import { getVideobyId } from "@/utils/video";
import EditVideoForm from "@/components/studios/sections/EditVideoForm";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: { params: { id: string } }): Promise<Metadata> {
  const id = params.id;
  const video = await getVideobyId(id);

  if (!video) {
    return {
      title: "Video Not Found - SignFlix Studio",
      description: "The video you are looking for does not exist.",
    };
  }

  const title = `Edit Video: ${video.title} - SignFlix Studio`;
  const description = `Edit details for video "${video.title}" on SignFlix Studio.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: video.thumbnailUrl || "/placeholder-logo.png", 
          alt: title,
        },
      ],
      siteName: "SignFlix Studio",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [video.thumbnailUrl || "/placeholder-logo.png"],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-7xl mx-auto">
      <EditVideoForm id={id} />
    </div>
  );
}
