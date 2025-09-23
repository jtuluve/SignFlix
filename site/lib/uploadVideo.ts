"use server";

import {Prisma } from "@prisma/client";
import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { QueueClient } from "@azure/storage-queue";
import path from "path";
import { createVideo } from "@/utils/video";
const account = process.env.AZURE_STORAGE_ACCOUNT;
const sasToken = process.env.AZURE_BLOB_SAS_TOKEN;
const queueConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;



type UploadVideoInput = {
  metadata: Prisma.VideoCreateInput & { videoUrl?: string }; // e.g., title, description
  videoFile: File;
  captionFile?: File;
  thumbnailFile?: File; // uploaded by user
};

export default async function uploadVideo({
  metadata,
  videoFile,
  captionFile,
  thumbnailFile,
}: UploadVideoInput) {
    try{
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
  metadata.videoUrl = url;

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
    metadata.captionUrl = url;

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
  metadata.thumbnailUrl = url;

  
  //pushing to db
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
