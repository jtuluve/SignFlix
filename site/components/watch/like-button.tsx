
"use client"

import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { likeVideo, unlikeVideo } from "@/utils/likes"

type LikeButtonProps = {
  videoId: string
  baseCount?: number
}

export default function LikeButton({ videoId, baseCount = 0 }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(baseCount);
  const [isLoading, setIsLoading] = useState(false);

  async function toggle() {
    setIsLoading(true);
    try {
        if (liked) {
            await unlikeVideo(videoId);
            setCount(c => c - 1);
        } else {
            await likeVideo(videoId);
            setCount(c => c + 1);
        }
        setLiked(!liked);
    } catch (error) {
      console.error("Failed to like video:", error);
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
