import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type Video, type User } from "@prisma/client";
import { useRouter } from "next/navigation";

type VideoWithUploader = Video & { uploader: User };

export default function VideoCard({ video }: { video: VideoWithUploader }) {
  const router = useRouter();

  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/channel/${video.uploader.id}`);
  };

  return (
    <div className="group">
      <div className="space-y-3">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={video.thumbnailUrl || "/placeholder.svg"}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {video.duration}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div onClick={handleChannelClick} className="cursor-pointer">
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarFallback>{video.uploader.username.slice(0, 1)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium line-clamp-2 group-hover:text-blue-600">
              {video.title}
            </h3>
            <div onClick={handleChannelClick} className="cursor-pointer">
              <p className="text-sm text-gray-600 hover:text-blue-600">{video.uploader.username}</p>
            </div>
            <p className="text-sm text-gray-600">
              {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
