"use server";

import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { getServerSession } from "next-auth";
import { updateVideo as updateVideoData } from "@/utils/video";
import { getUserByEmail } from "@/utils/user";

const account = process.env.AZURE_STORAGE_ACCOUNT;
const sasToken = process.env.AZURE_BLOB_SAS_TOKEN;

export default async function updateVideoContent(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const tags = formData.get("tags") as string;
  const category = formData.get("category") as string;
  const thumbnailFile = formData.get("thumbnail") as File;

  try {
    const session = await getServerSession();
    const user = await getUserByEmail(session?.user?.email);
    if (!user?.id) {
      throw new Error("Unauthorized");
    }

    let thumbnailUrl: string | undefined = undefined;

    if (thumbnailFile && thumbnailFile.size > 0) {
      const blobServiceClient = new BlobServiceClient(
        `https://${account}.blob.core.windows.net/?${sasToken}`
      );
      const containerName = "thumbnails";
      const containerClient = blobServiceClient.getContainerClient(containerName);
      await containerClient.createIfNotExists({ access: "container" });

      const blobName = `${uuidv4()}-${path.basename(thumbnailFile.name)}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: thumbnailFile.type },
      });
      thumbnailUrl = blockBlobClient.url;
    }

    const tagsArr = tags?.split(",").map((t) => t.trim()).filter(Boolean) || [];

    await updateVideoData(id, {
      title,
      description,
      category,
      tags: tagsArr,
      ...(thumbnailUrl && { thumbnailUrl }),
    });

  } catch (e: any) {
    console.error("Failed to update video:", e);
    throw new Error("Failed to update video");
  }
}
