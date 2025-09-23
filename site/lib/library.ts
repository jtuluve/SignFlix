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
