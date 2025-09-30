'use client'

import { useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SubscribeButton } from '@/components/subscriptions/subscribebutton';
import VideoCard from '@/components/videos/VideoCard';

export default function ChannelPage({ channel, videos }) {
  const [viewMode, setViewMode] = useState('grid');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-gray-200 h-32 md:h-48 lg:h-64 relative">
        <Image
          src={channel.coverUrl || '/placeholder.svg'}
          alt={`${channel.username}'s cover image`}
          layout="fill"
          objectFit="cover"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="-mt-12 sm:-mt-16 md:-mt-20 lg:-mt-24 flex items-end gap-4">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 border-4 border-white">
            <AvatarImage src={channel.avatarUrl} alt={channel.username} />
            <AvatarFallback>{channel.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="py-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{channel.username}</h1>
            <p className="text-sm text-gray-600">{channel._count.subscribers} subscribers &bull; {channel._count.videos} videos</p>
          </div>
        </div>

        <div className="mt-6">
          <SubscribeButton creatorId={channel.id} />
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Videos</h2>
            <div>
              <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>Grid</Button>
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>List</Button>
            </div>
          </div>

          {videos.length > 0 ? (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'gap-4'}`}>
              {videos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">This channel has no videos yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
