"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Grid,
    List,
    Video,
} from "lucide-react";
import deleteVideoById from "@/lib/deleteVideo";
import { getVideosByUser, requeueVideo, updateVideo } from "@/utils/video";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { type User } from "@prisma/client";
import GridViewCard from "./GridViewCard";
import ListViewCard from "./ListViewCard";
import GridSkeletonCard from "./GridSkeletonCard";
import ListSkeletonCard from "./ListSkeletonCard";

type GetVideosByUserSignature = (
    uploaderId: string,
    take?: number,
    skip?: number,
    isPublished?: boolean
) => Promise<UploadedVideo[]>;

const typedGetVideosByUser: GetVideosByUserSignature = getVideosByUser;

export type UploadedVideo = {
    id: string;
    createdAt: Date;
    title: string;
    description: string | null;
    videoUrl: string;
    thumbnailUrl: string | null;
    duration: number | null;
    views: number;
    likes: number;
    tags: string[];
    category: string | null;
    uploaderId: string;
    uploader: User;
    isPublished: boolean;
    _count: {
        likesList: number;
    };
};

const BATCH_SIZE = 8;

export default function VideosSection() {
    const { data: session } = useSession();
    const [videos, setVideos] = useState<UploadedVideo[]>([]);
    const [layout, setLayout] = useState<"grid" | "list">("list");
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState<"published" | "draft">("published");

    const handleDelete = async (id: string) => {
        if (!session?.user?.id) {
            toast.error("Authentication error. Please sign in again.");
            return;
        }
        try {
            await deleteVideoById(id);
            setVideos((prevVideos) => prevVideos.filter((video) => video.id !== id));
            toast.success("Video deleted successfully.");
        } catch (error) {
            toast.error("Failed to delete video. Please try again.");
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        loadVideos(1);

        return () => clearTimeout(timer);
    }, [session?.user?.id, filterStatus]);

    const loadVideos = async (pageNum: number) => {
        if (!session?.user?.id) return;
        setIsLoading(true);
        try {
            const newVideos = await typedGetVideosByUser(session.user.id, BATCH_SIZE, (pageNum - 1) * BATCH_SIZE, filterStatus === "published");
            if (pageNum === 1) {
                setVideos(newVideos);
            } else {
                setVideos((prevVideos) => [...prevVideos, ...newVideos]);
            }
            setHasMore(newVideos.length === BATCH_SIZE);
        } catch (error) {
            console.error("Failed to fetch videos:", error);
            toast.error("Failed to fetch videos.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadVideos(nextPage);
    };

    const handlePublish = async (id: string) => {
        try {
            // Call API to update isPublished status
            await updateVideo(id, { isPublished: true });
            toast.success("Video published successfully!");
            loadVideos(1); // Reload videos to reflect changes
        } catch (error) {
            toast.error("Failed to publish video. Please try again.");
        }
    };

    const handleRetry = async (id: string) => {
        try {
            // Call API to re-queue video for processing
            await requeueVideo(id);
            toast.success("Video re-queued for processing!");
            loadVideos(1); // Reload videos to reflect changes
        } catch (error) {
            toast.error("Failed to re-queue video. Please try again.");
        }
    };

    if (videos.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-5.5rem)] md:min-h-[calc(100vh-4rem)]">
                <Video className="w-24 h-24 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold mb-2">No videos found</h2>
                <p className="text-gray-500 mb-6">
                    Looks like you haven't uploaded any videos, or there was an issue loading them. Get started by uploading your first one!
                </p>
                <Link href="/upload">
                    <Button>Upload Video</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <Toaster position="top-right" closeButton />
            <div className="flex items-center flex-col md:flex-row md:justify-between mb-8">
                <h1 className="text-3xl font-bold">My Content</h1>
                <div className="flex items-center gap-2">
                    <Button
                        variant={filterStatus === "published" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("published")}
                    >
                        Published
                    </Button>
                    <Button
                        variant={filterStatus === "draft" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("draft")}
                    >
                        Drafts
                    </Button>
                    <Button
                        variant={layout === "list" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setLayout("list")}
                        aria-label="List view"
                    >
                        <List className="w-5 h-5" />
                    </Button>
                    <Button
                        variant={layout === "grid" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setLayout("grid")}
                        aria-label="Grid view"
                    >
                        <Grid className="w-5 h-5" />
                    </Button>
                    <Link href="/upload">
                        <Button>Upload New Video</Button>
                    </Link>
                </div>
            </div>

            {isLoading && videos.length === 0 ? (
                <VideosSkeleton layout={layout} />
            ) : (
                <>
                    <div
                        className={cn(
                            "transition-all duration-300",
                            layout === "grid"
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                : "flex flex-col space-y-4"
                        )}
                    >
                        {videos.map((video) =>
                            layout === "grid" ? (
                                <GridViewCard key={video.id} video={video} onDelete={handleDelete} onPublish={handlePublish} onRetry={handleRetry} />
                            ) : (
                                <ListViewCard key={video.id} video={video} onDelete={handleDelete} onPublish={handlePublish} onRetry={handleRetry} />
                            )
                        )}
                    </div>
                    {hasMore && (
                        <div className="flex justify-center mt-8">
                            <Button onClick={handleLoadMore} disabled={isLoading}>
                                {isLoading ? "Loading..." : "Load More"}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

const VideosSkeleton = ({ layout }: { layout: "grid" | "list" }) => {
    const skeletonCount = BATCH_SIZE;
    return (
        <div
            className={cn(
                layout === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "flex flex-col space-y-4",
                "mt-4"
            )}
        >
            {Array.from({ length: skeletonCount }).map((_, i) =>
                layout === "grid" ? <GridSkeletonCard key={i} /> : <ListSkeletonCard key={i} />
            )}
        </div>
    );
};