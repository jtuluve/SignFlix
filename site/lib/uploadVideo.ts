"use server";

import { PrismaClient, Prisma } from "@prisma/client";
import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { QueueClient } from "@azure/storage-queue";
import path from "path";
import { createVideo, getVideo } from "@/utils/video";
const account = process.env.AZURE_STORAGE_ACCOUNT;
const sasToken = process.env.AZURE_BLOB_SAS_TOKEN;
const queueConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

const containerName = "videos";
const prisma = new PrismaClient();

type UploadVideoInput = {
  metadata: Prisma.VideoCreateInput & { videoUrl?: string }; // e.g., title, description
  file: File; // uploaded by user
};

export default async function uploadVideo({
  metadata,
  file,
}: UploadVideoInput) {
    try{
  //uploading to blob storage
  const blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net/?${sasToken}`
  );

  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists({ access: "container" });

  const blobName = `${uuidv4()}-${path.basename(file.name)}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: file.type },
  });

  //pushing to db
  const url = blockBlobClient.url;
  metadata.videoUrl = url;
  const videoCreated = await createVideo(metadata);

  //pushing to queue
  const queueName = "videoprocessing";
  const queueClient = new QueueClient(queueConnectionString, queueName);
  await queueClient.createIfNotExists();
  await queueClient.sendMessage(videoCreated.id);
}catch(e:any){
    console.log(e)
}
  //   return video;
}
