// lib/actions/subscription-actions.ts
"use server"

import { db } from "@/utils/prisma"; // Adjust path as needed
import { revalidatePath } from "next/cache";

// Get user subscriptions (creators they follow)
export async function getUserSubscriptionsAction(subscriberId: string) {
  try {
    return await db.subscription.findMany({
      where: { subscriberId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            subscribersCount: true,
            role: true,
          }
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    throw new Error('Failed to fetch subscriptions');
  }
}

// Get videos from subscribed channels with filtering and pagination
export async function getSubscriptionVideosAction(
  subscriberId: string,
  creatorId?: string | null,
  timeFilter: 'all' | 'today' | 'this-week' = 'all',
  page: number = 0,
  limit: number = 10
) {
  try {
    // First get the user's subscriptions
    const subscriptions = await db.subscription.findMany({
      where: { subscriberId },
      select: { creatorId: true }
    });

    const subscribedCreatorIds = subscriptions.map(sub => sub.creatorId);

    if (subscribedCreatorIds.length === 0) {
      return { videos: [], hasMore: false };
    }

    // Build where clause for filtering
    let whereClause: any = {
      uploaderId: creatorId 
        ? { in: [creatorId] } 
        : { in: subscribedCreatorIds },
      isPublished: true
    };

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      let startDate: Date;

      if (timeFilter === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (timeFilter === 'this-week') {
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
      }

      whereClause.createdAt = {
        gte: startDate
      };
    }

    // Get videos with pagination
    const videos = await db.video.findMany({
      where: whereClause,
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            role: true,
          }
        },
        _count: {
          select: {
            likesList: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: page * limit,
      take: limit + 1, // Take one extra to check if there are more
    });

    const hasMore = videos.length > limit;
    const videoData = hasMore ? videos.slice(0, limit) : videos;

    return {
      videos: videoData,
      hasMore
    };
  } catch (error) {
    console.error('Error fetching subscription videos:', error);
    throw new Error('Failed to fetch subscription videos');
  }
}

// Get suggested videos for users with no subscriptions
export async function getSuggestedVideosAction(limit: number = 10) {
  try {
    const videos = await db.video.findMany({
      where: { isPublished: true },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            role: true,
          }
        },
        _count: {
          select: {
            likesList: true,
          },
        },
      },
      orderBy: [
        { views: "desc" },
        { createdAt: "desc" }
      ],
      take: limit,
    });

    return videos;
  } catch (error) {
    console.error('Error fetching suggested videos:', error);
    throw new Error('Failed to fetch suggested videos');
  }
}

// Get videos by specific user/creator
export async function getVideosByUserAction(uploaderId: string, page: number = 0, limit: number = 10) {
  try {
    const videos = await db.video.findMany({
      where: { uploaderId },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            role: true,
          }
        },
        _count: {
          select: {
            likesList: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: page * limit,
      take: limit + 1,
    });

    const hasMore = videos.length > limit;
    const videoData = hasMore ? videos.slice(0, limit) : videos;

    return {
      videos: videoData,
      hasMore
    };
  } catch (error) {
    console.error('Error fetching videos by user:', error);
    throw new Error('Failed to fetch user videos');
  }
}

// Subscribe to a creator
export async function subscribeToCreatorAction(subscriberId: string, creatorId: string) {
  try {
    // Check if already subscribed
    const existingSubscription = await db.subscription.findFirst({
      where: {
        subscriberId,
        creatorId
      }
    });

    if (existingSubscription) {
      throw new Error('Already subscribed to this creator');
    }

    // Create subscription
    const subscription = await db.subscription.create({
      data: {
        subscriberId,
        creatorId
      }
    });

    // Update creator's subscriber count
    await db.user.update({
      where: { id: creatorId },
      data: {
        subscribersCount: {
          increment: 1
        }
      }
    });

    // Revalidate relevant pages
    revalidatePath('/subscriptions');
    revalidatePath(`/channel/${creatorId}`);

    return subscription;
  } catch (error) {
    console.error('Error subscribing to creator:', error);
    throw error;
  }
}

// Unsubscribe from a creator
export async function unsubscribeFromCreatorAction(subscriberId: string, creatorId: string) {
  try {
    const subscription = await db.subscription.findFirst({
      where: {
        subscriberId,
        creatorId
      }
    });

    if (!subscription) {
      throw new Error('Not subscribed to this creator');
    }

    // Delete subscription
    await db.subscription.delete({
      where: {
        id: subscription.id
      }
    });

    // Update creator's subscriber count
    await db.user.update({
      where: { id: creatorId },
      data: {
        subscribersCount: {
          decrement: 1
        }
      }
    });

    // Revalidate relevant pages
    revalidatePath('/subscriptions');
    revalidatePath(`/channel/${creatorId}`);

    return true;
  } catch (error) {
    console.error('Error unsubscribing from creator:', error);
    throw error;
  }
}

// Check if user is subscribed to a creator
export async function isSubscribedToCreatorAction(subscriberId: string, creatorId: string) {
  try {
    const subscription = await db.subscription.findFirst({
      where: {
        subscriberId,
        creatorId
      }
    });

    return !!subscription;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    throw new Error('Failed to check subscription status');
  }
}

// Get subscription count for a creator
export async function getSubscriptionCountAction(creatorId: string) {
  try {
    const count = await db.subscription.count({
      where: { creatorId }
    });

    return count;
  } catch (error) {
    console.error('Error getting subscription count:', error);
    throw new Error('Failed to get subscription count');
  }
}

// Toggle subscription (subscribe/unsubscribe)
export async function toggleSubscriptionAction(subscriberId: string, creatorId: string) {
  try {
    const isSubscribed = await isSubscribedToCreatorAction(subscriberId, creatorId);
    
    if (isSubscribed) {
      await unsubscribeFromCreatorAction(subscriberId, creatorId);
      return { subscribed: false };
    } else {
      await subscribeToCreatorAction(subscriberId, creatorId);
      return { subscribed: true };
    }
  } catch (error) {
    console.error('Error toggling subscription:', error);
    throw error;
  }
}