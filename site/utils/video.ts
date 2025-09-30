"use server";

import { db, type Prisma } from "@/utils/prisma";
import { QueueClient } from "@azure/storage-queue";

const QUEUE_NAME = process.env.VIDEO_QUEUE_NAME || "videos";
const QUEUE_CONNECTION_STRING = process.env.AZURE_QUEUE_CONNECTION_STRING;

export async function requeueVideo(id: string) {
  if (!QUEUE_CONNECTION_STRING) {
    console.error("AZURE_QUEUE_CONNECTION_STRING is not set.");
    throw new Error("Queue connection string not configured.");
  }

  try {
    const queueClient = new QueueClient(QUEUE_CONNECTION_STRING, QUEUE_NAME);
    await queueClient.createIfNotExists();
    await queueClient.sendMessage(id);
    console.log(`Video ${id} re-queued for processing.`);
  } catch (error) {
    console.error(`Failed to re-queue video ${id}:`, error);
    throw new Error("Failed to re-queue video.");
  }
}

export async function getVideos() {
  return await db.video.findMany({
    include: {
      uploader: true,
      _count: {
        select: {
          likesList: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVideobyId(id: string) {
  return await db.video.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      videoUrl: true,
      signVideoUrl: true,
      signTimeUrl: true,
      thumbnailUrl: true,
      captionUrl: true,
      duration: true,
      views: true,
      likes: true,
      tags: true,
      category: true,
      createdAt: true,
      uploaderId: true,
      uploader: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          bannerUrl: true,
          description: true,
          subscribersCount: true,
        },
      },
      likesList: {
        select: {
          id: true,
          userId: true,
        },
      },
      _count: {
        select: {
          likesList: true,
        },
      },
    },
  });
}

export async function getVideosByUser(uploaderId: string, take?: number, skip?: number) {
  return await db.video.findMany({
    where: { uploaderId },
    include: {
      uploader: true,
      _count: {
        select: {
          likesList: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });
}

export async function getVideosByCategory(category: string) {
  return await db.video.findMany({
    where: { category },
    include: {
      uploader: true,
      _count: {
        select: {
          likesList: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Search videos by title, description, or tags with exact string
// export async function searchVideos(query: string) {
//   // Sanitize and validate query
//   const sanitizedQuery = query.trim();
//   if (!sanitizedQuery || sanitizedQuery.length > 100) {
//     throw new Error('Search query too long');
//   }

//   return await db.video.findMany({
//     where: {
//       OR: [
//         { title: { contains: sanitizedQuery, mode: "insensitive" } },
//         { description: { contains: sanitizedQuery, mode: "insensitive" } },
//         { tags: { hasSome: [sanitizedQuery] } },
//       ],
//     },
//     include: {
//       uploader: true,
//       _count: {
//         select: {
//           likesList: true,
//         },
//       },
//     },
//     orderBy: { createdAt: "desc" },
//   });
// }

export async function searchVideos(query: string) {
  const sanitizedQuery = query.trim();
  if (!sanitizedQuery || sanitizedQuery.length > 100) {
    throw new Error("Search query too long");
  }

  return await db.$queryRawUnsafe(`
    SELECT v.*, u.*, COUNT(l."id") as "likesCount"
    FROM "Video" v
    JOIN "User" u ON u.id = v."uploaderId"
    LEFT JOIN "Like" l ON l."videoId" = v.id
    WHERE to_tsvector('english', v.title || ' ' || v.description || ' ' || array_to_string(v.tags, ' '))
      @@ plainto_tsquery('english', $1)
    GROUP BY v.id, u.id
    ORDER BY ts_rank(
      to_tsvector('english', v.title || ' ' || v.description || ' ' || array_to_string(v.tags, ' ')),
      plainto_tsquery('english', $1)
    ) DESC;
  `, sanitizedQuery);
}


export async function createVideo(video: Prisma.VideoCreateInput) {
  return await db.video.create({
    data: video,
    include: {
      uploader: true,
    },
  });
}

export async function updateVideo(id: string, video: Prisma.VideoUpdateInput) {
  return await db.video.update({
    where: { id },
    data: video,
    include: {
      uploader: true,
    },
  });
}

export async function deleteVideo(id: string) {
  return await db.video.delete({ where: { id } });
}

export async function incrementVideoViews(id: string) {
  return await db.video.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}