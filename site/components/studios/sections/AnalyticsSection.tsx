export default function AnalyticsSection() {
  // Schema-aligned metrics placeholders. Wire to db.getUserStats and aggregate video views/likes per uploader.
  const metrics = {
    totalViews: 234000,
    totalLikes: 12500,
    totalVideos: 24,
    subscribers: 12050,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Channel Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 border rounded-lg">
          <div className="text-2xl font-bold">{metrics.totalViews.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Views</div>
        </div>
        <div className="p-6 border rounded-lg">
          <div className="text-2xl font-bold">{metrics.subscribers.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Subscribers</div>
        </div>
        <div className="p-6 border rounded-lg">
          <div className="text-2xl font-bold">{metrics.totalLikes.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Likes</div>
        </div>
        <div className="p-6 border rounded-lg">
          <div className="text-2xl font-bold">{metrics.totalVideos.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Videos</div>
        </div>
      </div>

      <div className="border rounded-lg p-12 text-center text-gray-500">
        <p>Charts and trends coming soon</p>
        <p className="text-sm">Wire to your analytics data from Prisma aggregations</p>
      </div>
    </div>
  );
}
