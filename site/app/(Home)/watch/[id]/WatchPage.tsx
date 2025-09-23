
'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import LikeButton from "@/components/watch/like-button"
import WatchView from "@/components/watch/watch-view"
import { updateSubscriberCount } from "@/utils/subscription"
import { getUserByEmail } from "@/utils/user"
import { getVideobyId, incrementVideoViews } from "@/utils/video"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function WatchPage({ video, channel, videoUrl, captionUrl, signVideoUrl, posterUrl, title, views, time, description, id }) {
    const session = useSession();
    const [syncMode, setSyncMode] = useState<"adjust" | "pause">("pause");

    useEffect(() => {
        incrementVideoViews(id);
    }, [id]);

    async function onSubscribe() {
        if(!session?.data?.user){
          window.location.href = "/signin";
          return;
        }
        const creator = await getVideobyId(id);
        const user = await getUserByEmail(session.data.user.email);
        if(!creator || !user){
          return;
        }
        await updateSubscriberCount(creator.uploaderId,user.id, "subscribe");
      
      }

    return (
        <main className="min-h-screen bg-background">
        <script src="https://unpkg.com/pose-viewer@latest/dist/pose-viewer/pose-viewer.esm.js" type="module"></script>
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 gap-6">
            <WatchView
              videoUrl={videoUrl}
              captionUrl={captionUrl}
              posterUrl={posterUrl}
              signVideoUrl={signVideoUrl}
              syncMode={syncMode}
            />
  
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                      <Button variant={syncMode === 'pause' ? 'default' : 'outline'} onClick={() => setSyncMode('pause')}>Adjust by Pause</Button>
                      <Button variant={syncMode === 'adjust' ? 'default' : 'outline'} onClick={() => setSyncMode('adjust')}>Adjust by Speed</Button>
                  </div>
                  <LikeButton videoId={String(id)} baseCount={video.likes} />
              </div>
  
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
  
              <Separator />
  
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={channel?.avatar || "/placeholder.svg?height=80&width=80&query=channel%20avatar"}
                      alt={`${channel?.name ?? "Unknown Channel"} channel avatar`}
                    />
                    <AvatarFallback>{(channel?.name ?? "U").slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-lg">{channel?.name ?? "Unknown Channel"}</div>
                    <div className="text-sm text-muted-foreground">{Math.max(0, channel?.subscribers ?? 0)} subscribers</div>
                  </div>
                </div>
                {session?.data?.user?.id !== video.uploaderId && (
                    <Button className="shrink-0" size="lg" onClick={onSubscribe}>Subscribe</Button>
                )}
              </div>
            </section>
  
          </div>
        </div>
      </main>
    )
}
