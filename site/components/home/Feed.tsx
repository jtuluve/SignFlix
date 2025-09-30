
import Link from "next/link";
import Image from "next/image";
import { getVideos } from "@/utils/video";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { type Video, type User } from "@prisma/client";

type VideoWithUploader = Video & { uploader: User };

export default async function Feed() {
    const videos: VideoWithUploader[] = await getVideos() as VideoWithUploader[];

    if (videos.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">No videos yet</h2>
                    <p className="text-gray-500">It looks like there are no videos here. Why not upload one?</p>
                </div>
            </div>
        );
    }

	return (
		<div className="min-h-screen bg-background">
			<div className="flex">
				<main className="flex-1">
					<div className="p-6">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{videos.map((video) => (
								<Link
									key={video.id}
									href={`/watch/${video.id}`}
									className="group"
								>
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
											<Avatar className="w-9 h-9 flex-shrink-0">
												<AvatarFallback>{video.uploader.username.slice(0, 1)}</AvatarFallback>
											</Avatar>
											<div className="min-w-0 flex-1">
												<h3 className="font-medium line-clamp-2 group-hover:text-blue-600">
													{video.title}
												</h3>
												<p className="text-sm text-gray-600">{video.uploader.username}</p>
												<p className="text-sm text-gray-600">
													{video.views} views • {new Date(video.createdAt).toLocaleDateString()}
												</p>
											</div>
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
