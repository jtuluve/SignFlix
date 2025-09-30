"use server";

import { getServerSession } from "next-auth";
import { deleteVideo } from "@/utils/video";
import { getUserByEmail } from "@/utils/user";

export default async function deleteVideoById(id: string) {
  try {
    const session = await getServerSession();
    const user = await getUserByEmail(session?.user?.email);
    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    // ✅ Check if the video belongs to the logged-in user
    // const video = await getVideoById(id);
    // console.log(video, user.id);
    // if (!video) {
    //   throw new Error("Video not found");
    // }

    // if (video.uploaderId !== user.id) {
    //   throw new Error("You are not allowed to delete this video");
    // }

    // ✅ Delete the video
    const deleted = await deleteVideo(id);
  } catch (e: any) {
    console.error("Failed to delete video:", e);
    throw new Error("Failed to delete video");
  }
}
