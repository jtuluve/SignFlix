
import WatchPage from "./WatchPage";
import { getVideobyId } from "@/utils/video";
import type { Metadata } from "next";

type PageProps = {
  params?: { id?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const id = awaitedParams?.id ?? "1";
  const video = await getVideobyId(id);

  if (!video) {
    return {
      title: "Video Not Found - SignFlix",
      description: "The video you are looking for does not exist.",
    };
  }

  const title = video.title;
  const description = video.description || "Watch this video on SignFlix.";
  const thumbnailUrl = video.thumbnailUrl || "/placeholder.svg";

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: thumbnailUrl,
          alt: title,
        },
      ],
      type: "video.other",
      siteName: "SignFlix",
    },
    twitter: {
      card: "player",
      title: title,
      description: description,
      images: [thumbnailUrl],
      creator: video.uploader.username,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const id = params?.id ?? "1";
  const video = await getVideobyId(id);

  const videoUrl = video?.videoUrl ?? null
  const captionUrl = video?.captionUrl ?? null
  const signVideoUrl = video?.signVideoUrl ?? null
  const posterUrl = video?.thumbnailUrl || "/placeholder.svg?height=720&width=1280"

  const title = video?.title ?? "Untitled"
  const views = video?.views ?? "—"
  const time = video?.createdAt ? new Date(video.createdAt).toLocaleDateString() : "—"
  const description = video?.description ?? "No description provided."
  
  let channel: any | null = null
  if (video?.uploader) {
    channel = { 
        id: video.uploader.id, 
        name: video.uploader.username, 
        avatar: video.uploader.avatarUrl,
        subscribers: video.uploader.subscribersCount,
        isVerified: video.uploader.role === 'ADMIN'
    }
  }

  return (
    <WatchPage 
        video={video} 
        channel={channel} 
        videoUrl={videoUrl} 
        captionUrl={captionUrl} 
        signVideoUrl={signVideoUrl} 
        posterUrl={posterUrl} 
        title={title} 
        views={views} 
        time={time} 
        description={description} 
        id={id} 
    />
  )
}
