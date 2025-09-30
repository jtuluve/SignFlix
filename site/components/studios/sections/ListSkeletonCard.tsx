import { Skeleton } from "@/components/ui/skeleton";

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

export default ListSkeletonCard;