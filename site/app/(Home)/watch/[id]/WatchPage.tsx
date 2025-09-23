
'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import LikeButton from "@/components/watch/like-button"
import WatchView from "@/components/watch/watch-view"
import { checkSubscription, toggleSubscription } from "@/utils/subscription"
import { getVideobyId, incrementVideoViews } from "@/utils/video"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function WatchPage({ video, channel, videoUrl, captionUrl, signVideoUrl, posterUrl, title, views, time, description, id }) {
    const { data: session, status } = useSession();
    const [syncMode, setSyncMode] = useState<"adjust" | "pause">("pause");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribersCount, setSubscribersCount] = useState(channel?.subscribers ?? 0);

    useEffect(() => {
        incrementVideoViews(id);
    }, [id]);

    useEffect(() => {
      if (status === "authenticated" && session?.user?.id && channel?.id) {
        checkSubscription(session.user.id, channel.id).then(sub => {
          setIsSubscribed(!!sub);
        });
      }
    }, [status, session?.user?.id, channel?.id]);

    async function onToggleSubscribe() {
        if(status !== "authenticated" || !session?.user?.id){
          window.location.href = "/signin";
          return;
        }
        if (!channel?.id) {
          return;
        }

        const result = await toggleSubscription(channel.id, session.user.id);
        setIsSubscribed(result.subscribed);
        setSubscribersCount(prevCount => prevCount + (result.subscribed ? 1 : -1));
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
                    <div className="text-sm text-muted-foreground">{Math.max(0, subscribersCount)} subscribers</div>
                  </div>
                </div>
                {session?.data?.user?.id !== video.uploaderId && (
                    <Button className="shrink-0" size="lg" onClick={onToggleSubscribe}>
                      {isSubscribed ? "Subscribed" : "Subscribe"}
                    </Button>
                )}
              </div>
            </section>
  
          </div>
        </div>
      </main>
    )
}
