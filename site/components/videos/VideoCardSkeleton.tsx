import { Skeleton } from "@/components/ui/skeleton";

export default function VideoCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-video rounded-lg" />
      <div className="flex items-start gap-3">
        <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}
