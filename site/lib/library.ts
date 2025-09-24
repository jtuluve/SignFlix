'use server';
// src/utils/likedVideos.ts
import { db } from "@/utils/prisma"; // your Prisma client

export async function getLikedVideos(userId: string | undefined) {
  if (!userId) {
    return [];
  }
  return await db.like.findMany({
    where: { userId },
    include: {
      video: {
        include: {
            uploader: true,
            // channel: true,
            _count: {
                select: {
                    likesList: true,
                },
            },
        },
        },
  }
});
}

export async function isLikedByUser(videoId: string, userId: string) {
console.log("hbcjhbjch",userId);
  if (!userId) {
    return false;
  }
    const like = await db.like.findFirst({
    where: { videoId, userId },
  });
  return !!like;
}
