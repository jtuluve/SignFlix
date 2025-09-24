import EditVideoForm from "@/components/studios/sections/EditVideoForm";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: { params: { id: string } }): Promise<Metadata> {
  const id = params.id;
  const title = `Edit Video ${id} - SignFlix Studio`;
  const description = `Edit details for video ${id} on SignFlix Studio.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: "/placeholder-logo.png", // Using a default placeholder logo
          alt: title,
        },
      ],
      siteName: "SignFlix Studio",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: ["/placeholder-logo.png"],
    },
  };
}

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
