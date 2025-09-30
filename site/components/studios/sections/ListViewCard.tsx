import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Eye,
    Heart,
    Calendar,
    Edit,
    Trash2,
} from "lucide-react";
import { UploadedVideo } from "./VideosSection";
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

const ListViewCard = ({ video, onDelete, onPublish, onRetry }: { video: UploadedVideo; onDelete?: (id: string) => void; onPublish?: (id: string) => void; onRetry?: (id: string) => void }) => (
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
                {!video.isPublished && onPublish && onRetry && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded">
                        Draft
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
                        {!video.isPublished && onPublish && onRetry ? (
                            <>
                                <Button variant="outline" size="sm" onClick={() => onPublish(video.id)}>Publish</Button>
                                <Button variant="outline" size="sm" onClick={() => onRetry(video.id)}>Retry</Button>
                            </>
                        ) : (
                            <Link href={`/content/${video.id}`}>
                                <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                            </Link>
                        )}
                        {onDelete && <DeleteButton onDelete={() => onDelete(video.id)} />}
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

export default ListViewCard;