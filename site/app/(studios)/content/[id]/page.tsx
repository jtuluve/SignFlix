import EditVideoForm from "@/components/studios/sections/EditVideoForm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="max-w-7xl mx-auto">
      <EditVideoForm id={id} />
    </div>
  );
}
