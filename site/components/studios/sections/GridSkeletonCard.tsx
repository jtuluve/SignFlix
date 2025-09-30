import { Skeleton } from "@/components/ui/skeleton";

const GridSkeletonCard = () => (
    <div className="space-y-3">
        <Skeleton className="aspect-video rounded-lg" />
        <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    </div>
);

export default GridSkeletonCard;