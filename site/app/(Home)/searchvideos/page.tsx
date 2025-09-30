import { searchVideos, getVideos } from "@/utils/video";
import { type Video, type User } from "@prisma/client";
import type { Metadata } from "next";
import VideoCard from "@/components/videos/VideoCard";

export async function generateMetadata({
  searchParams,
}: { searchParams: { q?: string } }): Promise<Metadata> {
  const q = (searchParams?.q ?? "").toString().trim();
  const title = q ? `Search results for "${q}" - SignFlix` : "Search Videos - SignFlix";
  const description = q
    ? `Explore videos related to "${q}" on SignFlix.`
    : "Search for videos with sign language interpretation on SignFlix.";

  return {
    title: title,
    description: description,
  };
}

type SearchedVideo = Video & { uploader: User };

export default async function Page({
  searchParams,
}: { searchParams: { q?: string } }) {
  const q = (searchParams?.q ?? "").toString().trim();
  let videos: SearchedVideo[] = [];

  if (q) {
    videos = await searchVideos(q) as SearchedVideo[];
  } else {
    videos = await getVideos() as SearchedVideo[];
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1">
          <div className="p-6">
            {q && (
              <h2 className="text-lg font-medium mb-4">
                Search results for: <span className="font-semibold">{q}</span>
              </h2>
            )}
            {videos.length === 0 && (
              <div className="col-span-full text-center py-16">
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  No results found for "{q}"
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Try searching for something else.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}