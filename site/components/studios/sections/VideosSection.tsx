"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  Edit,
  BarChart3,
  Trash2,
} from "lucide-react";
import deleteVideoById from "@/lib/deleteVideo";
import { getVideosByUser } from "@/utils/video";
import { useSession } from "next-auth/react";

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
};

export default function VideosSection() {
  const { data: session } = useSession();
  const [userId, setUserId] = useState(session?.user?.id);
  const [videos, setVideos] = useState<UploadedVideo[]>([]);

  const handleDelete = async (id: string) => {
    await deleteVideoById(id);
    const newVideos = await getVideosByUser(userId);
    setVideos(newVideos);
  };

  useEffect(() => {
    (async () => {
      const newVideos = await getVideosByUser(userId);
      setVideos(newVideos);
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Videos</h2>
      </div>

      <div className="space-y-4">
        {videos.map((video) => (
          <Card key={video.id}>
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="relative w-48 aspect-video rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    priority={true}
                    src={video.thumbnailUrl || "/placeholder.svg"}
                    alt={video.title}
                    fill
                    className="object-cover"
                  />
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                      {video.duration}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {video.title}
                    </h3>
                    {video.category && (
                      <Badge variant="secondary">{video.category}</Badge>
                    )}
                  </div>

                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {video.tags.map((t) => (
                        <Badge key={t} variant="outline">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {video.description}
                  </p>

                  <div className="grid grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {video.views} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" /> {video.likes} likes
                    </div>
                    {/* <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" /> {video.comments} comments
                    </div> */}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />{" "}
                      {new Date(video.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/studios/content/${video.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                    </Link>
                    {/* <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" /> Analytics
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" /> View
                    </Button> */}
                    <Button
                      onClick={() => handleDelete(video.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
