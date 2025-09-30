
import { getUser } from '@/utils/user';
import { getVideosByUser } from '@/utils/video';
import ChannelPage from '@/components/channel/ChannelPage';
import { notFound } from 'next/navigation';
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const channel = await getUser(params.id);

  if (!channel) {
    return {
      title: "Channel Not Found - SignFlix",
      description: "The channel you are looking for does not exist.",
    };
  }

  const title = `${channel.username} - SignFlix Channel`;
  const description = channel.description || `Explore videos from ${channel.username} on SignFlix. An accessible video streaming platform with sign language interpretation.`;
  const imageUrl = channel.bannerUrl || channel.avatarUrl || "/placeholder-logo.png";
  const keywords = ["SignFlix", "sign language", "ASL", "BSL", "video streaming", "accessible video", "Deaf community", "hard of hearing", "channel", channel.username, ...(channel.bio?.split(' ') || [])];

  return {
    title: title,
    description: description,
    keywords: keywords,
    openGraph: {
      title: title,
      description: description,
      url: `https://signflix.com/channel/${channel.id}`,
      siteName: "SignFlix",
      type: "profile",
      images: [
        {
          url: imageUrl,
          alt: `${channel.username}'s channel banner`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [imageUrl],
      creator: channel.username,
    },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const param = await params;
  const channel = await getUser(param.id);
  const videos = await getVideosByUser(param.id, undefined, undefined, true);

  if (!channel) {
    notFound();
  }

  return <ChannelPage channel={channel} videos={videos} />;
}
