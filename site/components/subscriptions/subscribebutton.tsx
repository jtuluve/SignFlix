import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { 
  toggleSubscriptionAction, 
  isSubscribedToCreatorAction 
} from "@/lib/subscriptions";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface SubscribeButtonProps {
  creatorId: string;
  initialIsSubscribed?: boolean;
  onSubscriptionChange?: (isSubscribed: boolean) => void;
  variant?: "default" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
  showSubscriberCount?: boolean;
  subscriberCount?: number;
}

export function SubscribeButton({
  creatorId,
  initialIsSubscribed,
  onSubscriptionChange,
  variant = "default",
  size = "default",
  className = "",
  showSubscriberCount = false,
  subscriberCount = 0
}: SubscribeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed ?? false);
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  // Check subscription status when component mounts
  useEffect(() => {
    async function checkSubscription() {
      if (!session?.user?.id || session.user.id === creatorId) {
        setCheckingSubscription(false);
        return;
      }

      if (initialIsSubscribed === undefined) {
        try {
          const subscribed = await isSubscribedToCreatorAction(session.user.id, creatorId);
          setIsSubscribed(subscribed);
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      }
      
      setCheckingSubscription(false);
    }

    checkSubscription();
  }, [session?.user?.id, creatorId, initialIsSubscribed]);

  const handleSubscribe = async () => {
    if (!session?.user?.id) {
      // Redirect to login
      router.push('/signin');
      return;
    }

    if (session.user.id === creatorId) {
      return; // Can't subscribe to yourself
    }

    setLoading(true);
    try {
      const result = await toggleSubscriptionAction(session.user.id, creatorId);
      setIsSubscribed(result.subscribed);
      onSubscriptionChange?.(result.subscribed);
      
      // Optionally show a success message/toast here
      console.log("routerrrrrrrr")
      window.location.reload(); // Refresh to update subscriber count if shown
    } catch (error) {
      console.error('Error toggling subscription:', error);
      // Optionally show an error message/toast here
    } finally {
      setLoading(false);
    }
  };

  // Don't show button for own channel or when not logged in and checking
  if (!session?.user?.id || session.user.id === creatorId) {
    return null;
  }

  // Show loading state while checking subscription
  if (checkingSubscription) {
    return (
      <Button
        variant="outline"
        size={size}
        className={className}
        disabled={true}
      >
        <Skeleton className="h-4 w-20" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isSubscribed ? "outline" : variant}
        size={size}
        className={className}
        onClick={handleSubscribe}
        disabled={loading}
      >
        {loading ? (
          <Skeleton className="h-4 w-20" />
        ) : null}
        {isSubscribed ? "Unsubscribe" : "Subscribe"}
      </Button>
      
      {showSubscriberCount && (
        <span className="text-sm text-gray-600">
          {subscriberCount.toLocaleString()} subscriber{subscriberCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}

export function QuickSubscribeButton({ 
  creatorId, 
  className = "" 
}: { 
  creatorId: string; 
  className?: string; 
}) {
  return (
    <SubscribeButton 
      creatorId={creatorId}
      variant="default"
      size="sm"
      className={className}
    />
  );
}