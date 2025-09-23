import Link from "next/link";
import Image from "next/image";
import { searchVideos } from "@/utils/video";

function formatNumberShort(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

export default async function Page({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams?.q ?? "").toString().trim();

  let dbVideos: Awaited<ReturnType<typeof searchVideos>> = [] as any;
  if (q) {
    try {
      dbVideos = await searchVideos(q);
    } catch (e) {
      // If the util throws for invalid query length, just keep empty results
      dbVideos = [] as any;
    }
  }

  const items = (dbVideos || []).map((v) => {
    return {
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnailUrl || "/placeholder.svg",
      duration: formatDuration(v.duration ?? undefined),
      views: formatNumberShort(v.views ?? 0),
      time: formatTimeAgo(new Date(v.createdAt)),
      channel: v.uploader?.username || "Unknown",
    };
  });

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((video) => (
                <Link key={video.id} href={`/watch/${video.id}`} className="group">
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                          {video.duration}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium line-clamp-2 group-hover:text-blue-600">{video.title}</h3>
                      <p className="text-sm text-gray-600">{video.channel}</p>
                      <p className="text-sm text-gray-600">{video.views} • {video.time}</p>
                    </div>
                  </div>
                </Link>
              ))}
              {!q && items.length === 0 && (
                <div className="col-span-full text-sm text-gray-600">Enter a search query to see results.</div>
              )}
              {q && items.length === 0 && (
                <div className="col-span-full text-sm text-gray-600">No results found.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
