'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import LikeButton from "@/components/watch/like-button"
import WatchView from "@/components/watch/watch-view"
import { checkSubscription, toggleSubscription } from "@/utils/subscription"
import { getVideobyId, incrementVideoViews } from "@/utils/video"
import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import { isVideoLiked } from "@/utils/likes"
import Link from "next/link"

const POLLING_INTERVAL = 5000;
const MAX_POLLING_ATTEMPTS = 60;

export default function WatchPage({ video, channel, videoUrl, captionUrl, signVideoUrl, posterUrl, title, views, time, description, id }) {
  const { data: session, status } = useSession();
  const [syncMode, setSyncMode] = useState<"adjust" | "pause">("pause");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(channel?.subscribers ?? 0);
  const [viewCount, setViewCount] = useState(views);
  const [initialLiked, setInitialLiked] = useState(false);
  const [currentSignVideoUrl, setCurrentSignVideoUrl] = useState(signVideoUrl);
  const [pollingAttempts, setPollingAttempts] = useState(0);

  useEffect(() => {
    incrementVideoViews(id).then(() => {
      setViewCount(prevCount => prevCount + 1);
    });
  }, [id]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id && channel?.id) {
      checkSubscription(session.user.id, channel.id).then(sub => {
        setIsSubscribed(!!sub);
      });
    }
  }, [status, session?.user?.id, channel?.id]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      isVideoLiked(id, session.user.id).then(liked => {
        setInitialLiked(liked);
      });
    }
  }, [status, session?.user?.id, id]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        console.log("WatchPage: Initial currentSignVideoUrl", currentSignVideoUrl);

        if (!currentSignVideoUrl && pollingAttempts < MAX_POLLING_ATTEMPTS) {
            intervalId = setInterval(async () => {
                setPollingAttempts(prev => {
                    console.log("WatchPage: Polling attempt", prev + 1);
                    return prev + 1;
                });
                try {
                    const updatedVideo = await getVideobyId(id);
                    console.log("WatchPage: Polling - updatedVideo", updatedVideo);
                    console.log("WatchPage: Polling - updatedVideo.signVideoUrl", updatedVideo?.signVideoUrl);
                    if (updatedVideo?.signVideoUrl) {
                        setCurrentSignVideoUrl(updatedVideo.signVideoUrl);
                        clearInterval(intervalId);
                        console.log("WatchPage: signVideoUrl updated, polling stopped.");
                    }
                } catch (error) {
                    console.error("WatchPage: Error polling for signVideoUrl:", error);
                }
            }, POLLING_INTERVAL);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
                console.log("WatchPage: Polling interval cleared.");
            }
        };
    }, [id, currentSignVideoUrl, pollingAttempts]);

  const onToggleSubscribe = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      window.location.href = "/signin";
      return;
    }
    if (!channel?.id) {
      return;
    }

    const result = await toggleSubscription(channel.id, session.user.id);
    setIsSubscribed(result.subscribed);
    setSubscribersCount(prevCount => prevCount + (result.subscribed ? 1 : -1));
  }, [status, session?.user?.id, channel?.id]);

  return (
    <main className="min-h-screen bg-background">
      <script src="https://unpkg.com/pose-viewer@latest/dist/pose-viewer/pose-viewer.esm.js" type="module"></script>
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6">
          <WatchView
            videoUrl={videoUrl}
            captionUrl={captionUrl}
            posterUrl={posterUrl}
            signVideoUrl={currentSignVideoUrl}
            syncMode={syncMode}
            video={video}
          />

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button variant={syncMode === 'pause' ? 'default' : 'outline'} onClick={() => setSyncMode('pause')}>Adjust by Pause</Button>
                <Button variant={syncMode === 'adjust' ? 'default' : 'outline'} onClick={() => setSyncMode('adjust')}>Adjust by Speed</Button>
              </div>
              <LikeButton videoId={String(id)} baseCount={video.likes} initialLiked={initialLiked} />
            </div>

            <h1 className="text-2xl font-bold">{title}</h1>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">{viewCount.toLocaleString()} views</p>
              <p className="text-sm text-muted-foreground">{time}</p>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href={`/channel/${channel?.id}`}>
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={channel?.avatar || "/placeholder.svg?height=80&width=80&query=channel%20avatar"}
                      alt={`${channel?.name ?? "Unknown Channel"} channel avatar`}
                    />
                    <AvatarFallback>{(channel?.name ?? "U").slice(0, 1)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link href={`/channel/${channel?.id}`}>
                    <div className="font-bold text-lg hover:text-blue-600">{channel?.name ?? "Unknown Channel"}</div>
                  </Link>
                  <div className="text-sm text-muted-foreground">{Math.max(0, subscribersCount)} subscribers</div>
                </div>
              </div>
              {session?.user?.id !== video.uploaderId && (
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