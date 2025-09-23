import EditVideoForm from "@/components/studios/sections/EditVideoForm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Edit Video</h1>
      <p className="text-sm text-gray-600">Video ID: {id}</p>
      <EditVideoForm id={id} />
    </div>
  );
}
