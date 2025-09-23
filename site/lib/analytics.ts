
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

        const viewsPerVideo = videos.length > 0 ? videos.map(video => ({ title: video.title, views: video.views })).slice(-10) : [{ title: 'No Videos', views: 0 }];
        const likesPerVideo = videos.length > 0 ? videos.map(video => ({ title: video.title, likes: video.likes })).slice(-10) : [{ title: 'No Videos', likes: 0 }];

        // Mock data for time-series
        const viewsOverTime = [
            { date: 'Jan', views: Math.floor(totalViews * 0.1) },
            { date: 'Feb', views: Math.floor(totalViews * 0.2) },
            { date: 'Mar', views: Math.floor(totalViews * 0.15) },
            { date: 'Apr', views: Math.floor(totalViews * 0.3) },
            { date: 'May', views: Math.floor(totalViews * 0.25) },
        ];
        if (totalViews === 0) {
            viewsOverTime.push({ date: 'Jun', views: 0 });
        }


        const subscribersOverTime = [
            { date: 'Jan', subscribers: Math.floor(subscribersCount * 0.2) },
            { date: 'Feb', subscribers: Math.floor(subscribersCount * 0.4) },
            { date: 'Mar', subscribers: Math.floor(subscribersCount * 0.5) },
            { date: 'Apr', subscribers: Math.floor(subscribersCount * 0.8) },
            { date: 'May', subscribers: subscribersCount },
        ];
        if (subscribersCount === 0) {
            subscribersOverTime.push({ date: 'Jun', subscribers: 0 });
        }


        return {
            totalViews,
            totalLikes,
            totalVideos,
            subscribers: subscribersCount ?? 0,
            viewsPerVideo,
            likesPerVideo,
            viewsOverTime,
            subscribersOverTime
        };
    } catch (e: any) {
        console.error("Failed to fetch analytics:", e);
        return {
            totalViews: 0,
            totalLikes: 0,
            totalVideos: 0,
            subscribers: 0,
            viewsPerVideo: [{ title: 'No Videos', views: 0 }],
            likesPerVideo: [{ title: 'No Videos', likes: 0 }],
            viewsOverTime: [{ date: 'Jan', views: 0 }, { date: 'Feb', views: 0 }],
            subscribersOverTime: [{ date: 'Jan', subscribers: 0 }, { date: 'Feb', subscribers: 0 }]
        };
    }
}
