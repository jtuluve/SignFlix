
import WatchPage from "./WatchPage";
import { getVideobyId } from "@/utils/video";

type PageProps = {
  params?: { id?: string };
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
