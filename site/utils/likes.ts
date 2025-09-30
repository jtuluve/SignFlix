"use server";

import { db, type Prisma } from "@/utils/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getLikes(page = 1, limit = 100) {
  const skip = (page - 1) * limit;
  return await db.like.findMany({
    skip,
    take: limit,
    include: {
      user: true,
      video: true,
    },
  });
}

export async function getLike(id: string) {
  return await db.like.findUnique({
    where: { id },
    include: {
      user: true,
      video: true,
    },
  });
}


export async function unlikeVideo(videoId: string) {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) throw new Error("Not authenticated");

  const like = await db.like.findFirst({
    where: {
      videoId,
      userId,
    },
  });
  if (!like) {
    // Nothing to unlike; return early
    return null;
  }
  return await deleteLike(like.id);
}

export async function getUserLikes(userId: string) {
  return await db.like.findMany({
    where: { userId },
    include: {
      video: {
        include: {
          uploader: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVideoLikes(videoId: string, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  return await db.like.findMany({
    where: { videoId },
    skip,
    take: limit,
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function isVideoLiked(videoId: string, userId: string) {
  if (!userId) return false;
  const like = await db.like.findFirst({
    where: {
      videoId,
      userId,
    },
  });
  return !!like;
}

export async function likeVideo(videoId: string) {
  const session = await getServerSession(authOptions as any);
  const userId = (session as any)?.user?.id as string | undefined;
  if (!userId) throw new Error("Not authenticated");

  // Avoid duplicate likes
  const existing = await db.like.findFirst({ where: { userId, videoId } });
  if (existing) return existing;

  return await createLike({
    user: { connect: { id: userId } },
    video: { connect: { id: videoId } },
  });
}

export async function createLike(like: Prisma.LikeCreateInput) {
  return await db.$transaction(async (tx) => {
    const newLike = await tx.like.create({
      data: like,
      include: {
        user: true,
        video: true,
      },
    });

    if (newLike.videoId) {
      await tx.video.update({
        where: { id: newLike.videoId },
        data: { likes: { increment: 1 } },
      });
    }

    return newLike;
  });
}

export async function deleteLike(id: string) {
  return await db.$transaction(async (tx) => {
    const like = await tx.like.findUnique({ where: { id } });
    if (!like) throw new Error("Like not found");

    await tx.like.delete({ where: { id } });

    if (like.videoId) {
      await tx.video.update({
        where: { id: like.videoId },
        data: { likes: { decrement: 1 } },
      });
    }

    return like;
  });
}
