"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { likeVideo, unlikeVideo } from "@/utils/likes"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

type LikeButtonProps = {
  videoId: string
  baseCount?: number
  initialLiked?: boolean
}

export default function LikeButton({ videoId, baseCount = 0, initialLiked = false }: LikeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [count, setCount] = useState<number>(baseCount);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function toggle() {
    if (!session?.user) {
      // Redirect unauthenticated users to sign in
      router.push("/signin");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    // Optimistic update
    const prevLiked = liked;
    const prevCount = count;
    if (prevLiked) {
      setLiked(false);
      setCount(Math.max(0, prevCount - 1));
    } else {
      setLiked(true);
      setCount(prevCount + 1);
    }

    try {
      if (prevLiked) {
        await unlikeVideo(videoId);
      } else {
        await likeVideo(videoId);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Revert optimistic update on error
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant={liked ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={isLoading}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this video" : "Like this video"}
      className="gap-2"
    >
      <ThumbsUp className="h-4 w-4" />
      <span className="tabular-nums">{count.toLocaleString()}</span>
    </Button>
  )
}
