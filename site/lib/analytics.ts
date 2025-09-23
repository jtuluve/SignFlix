"use server";

import { getServerSession } from "next-auth";
import { getVideosByUser } from "@/utils/video";
import { getSubscribersCount, getUserByEmail } from "@/utils/user";

export default async function getUserAnalytics() {
  try {
    const session = await getServerSession();
    const user = await getUserByEmail(session.user.email);
    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    const userId = user.id;

    // Fetch videos uploaded by the user
    const videos = await getVideosByUser(userId);

    // Aggregate totals
    const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
    const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0);
    const totalVideos = videos.length;

    // Subscribers count (already stored in user table)
    const subscribersCount = await getSubscribersCount(userId);

    return {
      totalViews,
      totalLikes,
      totalVideos,
      subscribers: subscribersCount ?? 0,
    };
  } catch (e: any) {
    console.error("Failed to fetch analytics:", e);
    throw new Error("Failed to fetch analytics");
  }
}
