"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Eye,
    Heart,
    Calendar,
    Edit,
    Trash2,
    Video,
    Grid,
    List,
} from "lucide-react";
import deleteVideoById from "@/lib/deleteVideo";
import { getVideosByUser } from "@/utils/video";
import { useSession } from "next-auth/react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast, Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { type User } from "@prisma/client";

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
        console.log("useEffect called");
        loadVideos(1);
    }, [session?.user?.id]);

    const loadVideos = async (pageNum: number) => {
        if (!session?.user?.id) return;
        console.log("loadVideos called with pageNum:", pageNum);
        setIsLoading(true);
        try {
            const newVideos = await getVideosByUser(session.user.id, BATCH_SIZE, (pageNum - 1) * BATCH_SIZE);
            console.log("newVideos:", newVideos);
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

    if (videos.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-20">
                <Video className="w-24 h-24 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold mb-2">No videos yet</h2>
                <p className="text-gray-500 mb-6">
                    Looks like you haven't uploaded any videos. Get started by uploading your first one!
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
                                <GridViewCard key={video.id} video={video} onDelete={handleDelete} />
                            ) : (
                                <ListViewCard key={video.id} video={video} onDelete={handleDelete} />
                            )
                        )}
                    </div>
                    {hasMore && (
                        <div className="flex justify-center mt-8">
                            <Button onClick={handleLoadMore} disabled={isLoading}>
                                {isLoading ? <Skeleton className="h-4 w-20" /> : "Load More"}
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

const GridSkeletonCard = () => (
    <div className="space-y-3">
        <Skeleton className="aspect-video rounded-lg" />
        <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    </div>
);

const ListSkeletonCard = () => (
    <div className="flex flex-col md:flex-row gap-4">
        <Skeleton className="w-full md:w-64 h-40 md:h-auto flex-shrink-0 rounded-lg" />
        <div className="flex-1 space-y-3 py-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex items-center gap-4 pt-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </div>
    </div>
);

const GridViewCard = ({ video, onDelete }: { video: UploadedVideo; onDelete: (id: string) => void }) => (
    <Card className="overflow-hidden group">
        <div className="relative aspect-video bg-gray-100">
            <Link href={`/watch/${video.id}`} target="_blank">
                <Image
                    priority
                    src={video.thumbnailUrl || "/placeholder.svg"}
                    alt={video.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </Link>
            {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {video.duration}
                </div>
            )}
        </div>
        <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-lg line-clamp-2 h-14">
                {video.title}
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                <div className="flex items-center gap-1"><Eye className="w-4 h-4" /> {video.views}</div>
                <div className="flex items-center gap-1"><Heart className="w-4 h-4" /> {video._count.likesList}</div>
                <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(video.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center gap-2 pt-2">
                <Link href={`/content/${video.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                </Link>
                <DeleteButton onDelete={() => onDelete(video.id)} />
            </div>
        </CardContent>
    </Card>
);

const ListViewCard = ({ video, onDelete }: { video: UploadedVideo; onDelete: (id: string) => void }) => (
    <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
            <div className="relative w-full md:w-64 md:flex-shrink-0 aspect-video md:aspect-square bg-gray-100">
                <Link href={`/watch/${video.id}`} target="_blank">
                    <Image
                        priority
                        src={video.thumbnailUrl || "/placeholder.svg"}
                        alt={video.title}
                        fill
                        className="object-cover"
                    />
                </Link>
                {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                        {video.duration}
                    </div>
                )}
            </div>
            <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-xl line-clamp-2">
                            {video.title}
                        </h3>
                        {video.category && <Badge variant="secondary">{video.category}</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {video.description || "No description provided."}
                    </p>
                </div>
                <div className="mt-auto">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1"><Eye className="w-4 h-4" /> {video.views} views</div>
                        <div className="flex items-center gap-1"><Heart className="w-4 h-4" /> {video._count.likesList} likes</div>
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Published on {new Date(video.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/content/${video.id}`}>
                            <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                        </Link>
                        <DeleteButton onDelete={() => onDelete(video.id)} />
                    </div>
                </div>
            </CardContent>
        </div>
    </Card>
);

const DeleteButton = ({ onDelete }: { onDelete: () => void }) => (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" className="flex-shrink-0"><Trash2 className="w-4 h-4" /></Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your video and remove its data from our servers.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);