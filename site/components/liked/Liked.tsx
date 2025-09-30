'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Grid3X3, List, Heart } from 'lucide-react';
import { getLikedVideos } from "@/lib/library";
import { useSession } from "next-auth/react";
import VideoCard from "@/components/videos/VideoCard";
import VideoCardSkeleton from "@/components/videos/VideoCardSkeleton";
import { type Video, type User } from "@prisma/client";

type VideoWithUploader = Video & { uploader: User };

const Library = () => {
  const { data: session, status } = useSession();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title'>('recent');
  const [likedVideos, setLikedVideos] = useState<{ video: VideoWithUploader }[]>([]);

  useEffect(() => {
    if (status === 'authenticated') {
      (async () => {
        const liked = await getLikedVideos(session?.user?.id);
        setLikedVideos(liked);
      })();
    }
  }, [status, session]);

  if (status === 'loading') {
    return (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold mb-3 text-gray-900">
          Sign in to see your liked videos
        </h3>
        <Link href="/signin">
          <Button>Sign In</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-4 px-4 pb-20 md:pb-4">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Liked</h1>
              <p className="text-gray-600 text-sm">
                {likedVideos.length} video{likedVideos.length !== 1 ? 's' : ''} saved
              </p>
            </div>
          </div>

          {likedVideos.length > 0 && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Button
                  variant={sortBy === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('recent')}
                >
                  Most Recent
                </Button>
                <Button
                  variant={sortBy === 'oldest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('oldest')}
                >
                  Oldest
                </Button>
                <Button
                  variant={sortBy === 'title' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('title')}
                >
                  A-Z
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        {likedVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {likedVideos.map((video) => (
              <VideoCard key={video.video.id} video={video.video} />
            ))}
          </div>
        ) : (
          <EmptyLibraryState />
        )}
      </main>
    </div>
  );
};

const EmptyLibraryState = () => {
  return (
    <div className="text-center py-16">
      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-6" />
      <h3 className="text-xl font-semibold mb-3 text-gray-900">
        You haven't liked any videos yet
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Click the heart icon on a video to show your appreciation and save it here.
      </p>
      <Link href="/">
        <Button className="w-full sm:w-auto">
          Browse Videos
        </Button>
      </Link>
    </div>
  );
};

export default Library;
