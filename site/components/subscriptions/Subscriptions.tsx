"use client"

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, CheckCircle, Grid3X3, List, Play, Loader2 } from 'lucide-react';
import { useSession } from "next-auth/react";
import { 
  getUserSubscriptionsAction, 
  getSubscriptionVideosAction, 
  getSuggestedVideosAction,
  unsubscribeFromCreatorAction
} from "@/lib/subscriptions";
import { QuickSubscribeButton } from "@/components/subscriptions/subscribebutton";

interface Channel {
  id: string;
  username: string;
  avatarUrl?: string;
  subscribersCount: number;
  isVerified?: boolean;
}

interface Video {
  id: string;
  title: string;
  thumbnailUrl?: string;
  duration?: number;
  views: number;
  createdAt: Date;
  uploader: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  _count: {
    likesList: number;
  };
}

const Subscriptions = () => {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'today' | 'this-week'>('all');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [showAllChannels, setShowAllChannels] = useState(false);
  const [page, setPage] = useState(0);
  
  // Data states
  const [subscriptions, setSubscriptions] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [suggestedVideos, setSuggestedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [unsubscribeLoading, setUnsubscribeLoading] = useState<string | null>(null);

  // Handle unsubscribe from selected channel
  const handleUnsubscribe = async (creatorId: string) => {
    if (!session?.user?.id) return;
    
    setUnsubscribeLoading(creatorId);
    try {
      await unsubscribeFromCreatorAction(session.user.id, creatorId);
      
      // Update subscriptions list
      setSubscriptions(prev => prev.filter(sub => sub.id !== creatorId));
      
      // Clear selected channel if it was the unsubscribed one
      if (selectedChannelId === creatorId) {
        setSelectedChannelId(null);
      }
      
      // Refresh videos to reflect changes
      if (subscriptions.length <= 1) {
        // If this was the last subscription, fetch suggested videos
        const suggested = await getSuggestedVideosAction(10);
        setSuggestedVideos(suggested);
        setVideos([]);
      } else {
        // Refresh subscription videos
        const result = await getSubscriptionVideosAction(
          session.user.id,
          selectedChannelId === creatorId ? null : selectedChannelId,
          filter,
          0,
          10
        );
        setVideos(result.videos);
        setHasMore(result.hasMore);
        setPage(0);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    } finally {
      setUnsubscribeLoading(null);
    }
  };

  // Fetch subscription videos (only called when filters change)
  const fetchVideos = useCallback(async (pageNum: number = 0, reset: boolean = false) => {
    if (!session?.user?.id || subscriptions.length === 0) return;
    
    try {
      if (pageNum === 0 && !reset) setLoading(true); // Only show main loader on initial filter change
      else if (pageNum > 0) setLoadingMore(true);

      const result = await getSubscriptionVideosAction(
        session.user.id,
        selectedChannelId,
        filter,
        pageNum,
        10
      );

      if (reset || pageNum === 0) {
        setVideos(result.videos);
      } else {
        setVideos(prev => [...prev, ...result.videos]);
      }
      
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [session?.user?.id, selectedChannelId, filter, subscriptions.length]);

  // Remove the fetchSubscriptions and fetchSuggestedVideos useCallbacks since they're now inline

  // Initial load - fetch subscriptions and determine what to show
  useEffect(() => {
    const initializeData = async () => {
      if (!session?.user?.id) return;
      
      setLoading(true);
      try {
        // First, get user subscriptions
        const userSubscriptions = await getUserSubscriptionsAction(session.user.id);
        const channelData = userSubscriptions.map(sub => ({
          id: sub.creator.id,
          username: sub.creator.username,
          avatarUrl: sub.creator.avatarUrl,
          subscribersCount: sub.creator.subscribersCount,
          isVerified: sub.creator.role === 'ADMIN'
        }));
        setSubscriptions(channelData);

        // Then decide what videos to show
        if (channelData.length > 0) {
          // User has subscriptions - show subscription videos
          const result = await getSubscriptionVideosAction(
            session.user.id,
            null, // no specific channel filter initially
            'all', // all time filter initially
            0,
            10
          );
          setVideos(result.videos);
          setHasMore(result.hasMore);
        } else {
          // User has no subscriptions - show suggested videos
          const suggested = await getSuggestedVideosAction(10);
          setSuggestedVideos(suggested);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [session?.user?.id]);

  // Load videos when filters change (only if user has subscriptions)
  useEffect(() => {
    if (subscriptions.length > 0) {
      fetchVideos(0, true);
    }
  }, [selectedChannelId, filter]); // Remove subscriptions from dependencies

  // Handle load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchVideos(page + 1);
    }
  };

  // Handle show less
  const handleShowLess = () => {
    const firstBatch = videos.slice(0, 10);
    setVideos(firstBatch);
    setPage(0);
    setHasMore(true);
  };

  const displayedChannels = showAllChannels ? subscriptions : subscriptions.slice(0, 7);
  const selectedChannel = selectedChannelId ? subscriptions.find(c => c.id === selectedChannelId) : null;

  // Handle filter changes
  const handleFilterChange = (newFilter: 'all' | 'today' | 'this-week') => {
    setFilter(newFilter);
    // fetchVideos will be called by the useEffect
  };

  // Handle channel selection
  const handleChannelSelect = (channelId: string | null) => {
    setSelectedChannelId(channelId);
    // fetchVideos will be called by the useEffect
  };

  const handleAllChannels = () => {
    setSelectedChannelId(null);
    // fetchVideos will be called by the useEffect
  };

  // Format duration helper
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format time ago helper
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} days ago`;
    return `${Math.floor(diffInMinutes / 10080)} weeks ago`;
  };

  // Format views helper
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please sign in to view your subscriptions.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-4 px-4 pb-20 md:pb-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">
            {subscriptions.length === 0 ? 'Discover Videos' : 'Subscriptions'}
          </h1>

          {subscriptions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  type="button"
                  onClick={handleAllChannels}
                  className="flex-shrink-0 cursor-pointer transition-all duration-200"
                >
                  <div className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-colors ${!selectedChannelId
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'hover:bg-gray-100 border-2 border-transparent'
                    }`}>
                    <div className={`w-12 h-12 rounded-full cursor-pointer flex items-center justify-center ${!selectedChannelId ? 'bg-red-600' : 'bg-gray-200'
                      }`}>
                      <Grid3X3 className={`w-6 h-6 ${!selectedChannelId ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <span className={`text-xs font-medium px-6 cursor-pointer ${!selectedChannelId ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                      All
                    </span>
                  </div>
                </button>

                {displayedChannels.map((channel) => (
                  <div key={channel.id} className="relative flex-shrink-0 group">
                    <button
                      type="button"
                      onClick={() => handleChannelSelect(channel.id)}
                      className="transition-all cursor-pointer duration-200"
                    >
                      <div className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-colors ${selectedChannelId === channel.id
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'hover:bg-gray-100 border-2 border-transparent'
                        }`}>
                        <div className="relative cursor-pointer">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="font-semibold text-xl bg-gray-200 text-red-600">{channel.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {channel.isVerified && (
                            <CheckCircle className="absolute -bottom-1 -right-1 w-4 h-4 text-red-600 bg-white rounded-full" />
                          )}
                        </div>
                        <span className={`text-xs text-center max-w-16 truncate font-medium ${selectedChannelId === channel.id ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                          {channel.username}
                        </span>
                      </div>
                    </button>
                    
                  </div>
                ))}

                {subscriptions.length > 7 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 h-20 w-20 flex-col gap-1"
                    onClick={() => setShowAllChannels(!showAllChannels)}
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {showAllChannels ? '−' : `+${subscriptions.length - 7}`}
                      </span>
                    </div>
                    <span className="text-xs">{showAllChannels ? 'Less' : 'More'}</span>
                  </Button>
                )}
              </div>
            </div>
          )}

          {selectedChannel && (
            <div className="mb-4 p-4 bg-white rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="font-semibold text-xl text-blue-600">{selectedChannel.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{selectedChannel.username}</h2>
                      {selectedChannel.isVerified && (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatViews(selectedChannel.subscribersCount)} subscribers • {videos.length} videos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleUnsubscribe(selectedChannel.id)}
                    disabled={unsubscribeLoading === selectedChannel.id}
                  >
                    {unsubscribeLoading === selectedChannel.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Unsubscribe
                  </Button>
                </div>
              </div>
            </div>
          )}

          {subscriptions.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'today' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('today')}
                >
                  Today
                </Button>
                <Button
                  variant={filter === 'this-week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('this-week')}
                >
                  This week
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {videos.length} video{videos.length !== 1 ? 's' : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Show subscription videos if user has subscriptions */}
            {subscriptions.length > 0 && videos.length > 0 && (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                      <VideoCard 
                        key={video.id} 
                        video={video} 
                        showChannelInfo={!selectedChannel}
                        formatDuration={formatDuration}
                        formatTimeAgo={formatTimeAgo}
                        formatViews={formatViews}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {videos.map((video) => (
                      <VideoListItem 
                        key={video.id} 
                        video={video} 
                        showChannelInfo={!selectedChannel}
                        formatDuration={formatDuration}
                        formatTimeAgo={formatTimeAgo}
                        formatViews={formatViews}
                      />
                    ))}
                  </div>
                )}

                {/* Load More / Show Less controls */}
                {videos.length >= 10 && (
                  <div className="flex justify-center gap-4 mt-8">
                    {hasMore && (
                      <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                      >
                        {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Load More
                      </Button>
                    )}
                    {videos.length > 10 && (
                      <Button
                        variant="ghost"
                        onClick={handleShowLess}
                      >
                        Show Less
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Show suggested videos if no subscriptions */}
            {subscriptions.length === 0 && suggestedVideos.length > 0 && (
              <>
                <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <h2 className="font-bold text-blue-900 mb-2 text-lg">Welcome! Discover Amazing Content</h2>
                  <p className="text-blue-700 text-sm mb-3">
                    You haven't subscribed to any creators yet. Here are some popular videos to get you started!
                  </p>
                  <p className="text-blue-600 text-xs">
                    💡 Tip: Click the Subscribe button on videos you enjoy to see more content from those creators.
                  </p>
                </div>
                
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {suggestedVideos.map((video) => (
                      <VideoCard 
                        key={video.id} 
                        video={video} 
                        showChannelInfo={true}
                        formatDuration={formatDuration}
                        formatTimeAgo={formatTimeAgo}
                        formatViews={formatViews}
                        showSubscribeButton={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {suggestedVideos.map((video) => (
                      <VideoListItem 
                        key={video.id} 
                        video={video} 
                        showChannelInfo={true}
                        formatDuration={formatDuration}
                        formatTimeAgo={formatTimeAgo}
                        formatViews={formatViews}
                        showSubscribeButton={true}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Empty state */}
            {((subscriptions.length > 0 && videos.length === 0) || (subscriptions.length === 0 && suggestedVideos.length === 0)) && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  {selectedChannel ? (
                    <Avatar className="w-16 h-16">
                      <AvatarFallback className="font-semibold text-red-600">{selectedChannel.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Bell className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {subscriptions.length === 0 
                    ? 'No videos available'
                    : selectedChannel 
                    ? `No videos from ${selectedChannel.username}` 
                    : 'No videos found'
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {subscriptions.length === 0
                    ? 'Start by subscribing to some creators to see their latest videos here.'
                    : selectedChannel
                    ? `Try adjusting your filters or check back later for new content from ${selectedChannel.username}.`
                    : 'Try adjusting your filters or check back later for new content.'
                  }
                </p>
                {selectedChannel && (
                  <Button variant="outline" onClick={handleAllChannels}>
                    View All Channels
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const VideoCard = ({
  video,
  showChannelInfo = true,
  formatDuration,
  formatTimeAgo,
  formatViews,
  showSubscribeButton = false
}: {
  video: Video;
  showChannelInfo?: boolean;
  formatDuration: (seconds?: number) => string;
  formatTimeAgo: (date: Date) => string;
  formatViews: (views: number) => string;
  showSubscribeButton?: boolean;
}) => {
  return (
    <div className="space-y-3">
      <Link href={`/watch/${video.id}`} className="group block">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={video.thumbnailUrl || "/placeholder.svg"}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-500"
          />

          <div className="absolute bottom-2 right-2">
            <div className="bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          </div>

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </Link>

      <div className="space-y-2">
        <div className={`flex gap-3 ${showChannelInfo ? '' : 'justify-start'}`}>
          {showChannelInfo && (
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarFallback className="font-semibold bg-gray-200 text-black">{video.uploader.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0 flex-1">
            <Link href={`/watch/${video.id}`} className="group">
              <h3 className="font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">
                {video.title}
              </h3>
            </Link>
            {showChannelInfo && (
              <div className="flex items-center gap-1 mt-1">
                <Link href={`/channel/${video.uploader.id}`} className="hover:text-blue-600 transition-colors">
                  <p className="text-sm text-gray-600 hover:text-blue-600">{video.uploader.username}</p>
                </Link>
              </div>
            )}
            <p className="text-sm text-gray-600">
              {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
            </p>
            {showSubscribeButton && (
              <div className="mt-2">
                <QuickSubscribeButton creatorId={video.uploader.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoListItem = ({
  video,
  showChannelInfo = true,
  formatDuration,
  formatTimeAgo,
  formatViews,
  showSubscribeButton = false
}: {
  video: Video;
  showChannelInfo?: boolean;
  formatDuration: (seconds?: number) => string;
  formatTimeAgo: (date: Date) => string;
  formatViews: (views: number) => string;
  showSubscribeButton?: boolean;
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-0 md:gap-4 rounded-lg hover:bg-gray-50 transition-colors overflow-hidden md:p-4">
      <Link href={`/watch/${video.id}`} className="group">
        <div className="relative w-full md:w-48 aspect-video md:rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <Image
            src={video.thumbnailUrl || "/placeholder.svg"}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />

          <div className="absolute bottom-2 right-2">
            <div className="bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          </div>

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </Link>

      <div className="flex-1 min-w-0 p-3 md:p-0">
        <Link href={`/watch/${video.id}`} className="group">
          <h3 className="font-medium line-clamp-2 group-hover:text-blue-600 transition-colors mb-2 text-sm md:text-base">
            {video.title}
          </h3>
        </Link>

        {showChannelInfo && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5 md:w-6 md:h-6">
                <AvatarFallback className="font-semibold bg-gray-200 text-black">{video.uploader.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1">
                <Link href={`/channel/${video.uploader.id}`} className="hover:text-blue-600 transition-colors">
                  <p className="text-xs md:text-sm text-gray-600 hover:text-blue-600">{video.uploader.username}</p>
                </Link>
              </div>
            </div>
            {showSubscribeButton && (
              <QuickSubscribeButton creatorId={video.uploader.id} />
            )}
          </div>
        )}

        <p className="text-xs md:text-sm text-gray-600">
          {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default Subscriptions;