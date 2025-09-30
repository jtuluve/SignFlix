import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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

const GridViewCard = ({ video, onDelete, onPublish, onRetry }: { video: UploadedVideo; onDelete: (id: string) => void; onPublish: (id: string) => void; onRetry: (id: string) => void }) => (
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
            {!video.isPublished && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded">
                    Draft
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
                {!video.isPublished ? (
                    <>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => onPublish(video.id)}>Publish</Button>
                        <Button variant="outline" size="sm" className="w-full" onClick={() => onRetry(video.id)}>Retry</Button>
                    </>
                ) : (
                    <Link href={`/content/${video.id}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                    </Link>
                )}
                <DeleteButton onDelete={() => onDelete(video.id)} />
            </div>
        </CardContent>
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

export default GridViewCard;