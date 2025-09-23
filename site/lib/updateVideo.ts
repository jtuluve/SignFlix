"use server";

import { getServerSession } from "next-auth";
import { updateVideo } from "@/utils/video";
import { getUserByEmail } from "@/utils/user";

type UpdateVideoInput = {
  id: string; // video ID to update
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
};

export default async function updateVideoContent({
  id,
  title,
  description,
  tags,
  category,
}: UpdateVideoInput) {
  try {
    const session = await getServerSession();
    const user = await getUserByEmail(session?.user?.email);
    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    const updatedVideo = await updateVideo(id, {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(tags ? { tags } : {}),
      ...(category ? { category } : {}),
    });

  } catch (e: any) {
    console.error("Failed to update video:", e);
    throw new Error("Failed to update video");
  }
}
