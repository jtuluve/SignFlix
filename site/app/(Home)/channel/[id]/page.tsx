
import { getUser } from '@/utils/user';
import { getVideosByUser } from '@/utils/video';
import ChannelPage from '@/components/channel/ChannelPage';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const param = await params;
  const channel = await getUser(param.id);
  const videos = await getVideosByUser(param.id);

  if (!channel) {
    notFound();
  }

  return <ChannelPage channel={channel} videos={videos} />;
}
