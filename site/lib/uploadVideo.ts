"use server";

import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { QueueClient } from "@azure/storage-queue";
import path from "path";
import { createVideo } from "@/utils/video";
import { getServerSession } from "next-auth";

const account = process.env.AZURE_STORAGE_ACCOUNT;
const sasToken = process.env.AZURE_BLOB_SAS_TOKEN;
const queueConnectionString = process.env.AZURE_QUEUE_CONNECTION_STRING;

type meta = {
  title: string;
  description: string;
  tags: string[];
  category: string;
  captionUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  uploaderId?: string;
  duration?: number;
};

type UploadVideoInput = {
  data: meta; // e.g., title, description
  videoFile: File;
  captionFile?: File;
  thumbnailFile?: File; // uploaded by user
};

export default async function uploadVideo({
  data,
  videoFile,
  captionFile,
  thumbnailFile,
}: UploadVideoInput) {
  try {

    const session = await getServerSession();
    //uploading to video blob storage
    const blobServiceClient = new BlobServiceClient(
      `https://${account}.blob.core.windows.net/?${sasToken}`
    );
    let containerName = "videos";
    let containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: "container" });

    let blobName = `${uuidv4()}-${path.basename(videoFile.name)}`;
    let blockBlobClient = containerClient.getBlockBlobClient(blobName);

    let buffer = Buffer.from(await videoFile.arrayBuffer());
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: videoFile.type },
    });
    let url = blockBlobClient.url;
    data.videoUrl = url;

    //uploading caption to blob storage
    containerName = "captions";
    containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: "container" });

    blobName = `${uuidv4()}-${path.basename(captionFile.name)}`;

    blockBlobClient = containerClient.getBlockBlobClient(blobName);

    buffer = Buffer.from(await captionFile.arrayBuffer());
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: captionFile.type },
    });

    url = blockBlobClient.url;
    data.captionUrl = url;

    //pushing thumbnail to blob storage
    containerName = "thumbnails";
    containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: "container" });
    blobName = `${uuidv4()}-${path.basename(thumbnailFile.name)}`;

    blockBlobClient = containerClient.getBlockBlobClient(blobName);

    buffer = Buffer.from(await thumbnailFile.arrayBuffer());
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: thumbnailFile.type },
    });
    url = blockBlobClient.url;
    data.thumbnailUrl = url;

    //pushing to db

    const videoCreated = await createVideo({
      ...data,
      uploader: { connect: { email: session?.user.email } },
      videoUrl: data.videoUrl,
    });

    //pushing to queue

    const queueName = "videos";
    const queueClient = new QueueClient(queueConnectionString, queueName);
    await queueClient.createIfNotExists();
    await queueClient.sendMessage(videoCreated.id);
    await fetch(process.env.QUEUE_API_URL, { method: "POST" });
  } catch (e: any) {
    console.log(e);
  }
  //   return video;
}
