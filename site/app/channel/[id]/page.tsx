
import { getUser } from '@/utils/user';
import { getVideosByUser } from '@/utils/video';
import ChannelPage from '@/components/channel/ChannelPage';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const channel = await getUser(params.id);
  const videos = await getVideosByUser(params.id);

  if (!channel) {
    notFound();
  }

  return <ChannelPage channel={channel} videos={videos} />;
}
