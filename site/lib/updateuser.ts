"use server";

import { getServerSession } from "next-auth";
import { getUserByEmail, updateUser } from "@/utils/user";

type UpdateUserInput = {
  username?: string;
  bio?: string;
  description?: string;
  bannerUrl?: string;
};

export default async function updateUserProfile({
  username,
  bio,
  description,
  bannerUrl,
}: UpdateUserInput) {
  try {
    const session = await getServerSession();
    const user = await getUserByEmail(session.user.email);
    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    const updatedUser = await updateUser(user.id, {
      ...(username ? { username } : {}),
      ...(bio ? { bio } : {}),
      ...(description ? { description } : {}),
      ...(bannerUrl ? { bannerUrl } : {}),
    });

    return updatedUser;
  } catch (e: any) {
    console.error("Failed to update user:", e);
    throw new Error("Failed to update profile");
  }
}
