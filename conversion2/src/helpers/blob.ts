import { BlobServiceClient } from "@azure/storage-blob";
import { randomUUID } from "crypto";
import path = require("path");
import * as fs from "fs"

export async function uploadToBlob(containerName: string, filePath: string): Promise<string> {
  const storageAccount = process.env.AZURE_STORAGE_ACCOUNT;
  const sasToken = process.env.AZURE_BLOB_SAS_TOKEN;

  if (!storageAccount || !sasToken) {
    throw new Error("AZURE_STORAGE_ACCOUNT and AZURE_BLOB_SAS_TOKEN must be set in environment");
  }

  const blobService = new BlobServiceClient(`https://${storageAccount}.blob.core.windows.net?${sasToken}`);
  const client = blobService.getContainerClient(containerName);
  await client.createIfNotExists();

  const blobName = `${randomUUID()}-${path.basename(filePath)}`;
  const blockClient = client.getBlockBlobClient(blobName);

  const data = fs.readFileSync(filePath);
  await blockClient.uploadData(data, { blobHTTPHeaders: { blobContentType: mimeTypeForFile(filePath) } });

  return blockClient.url;
}

function mimeTypeForFile(filePath: string): string {
  const ext = (path.extname(filePath) || "").toLowerCase();
  if (ext === ".json") return "application/json";
  if (ext === ".mp4" || ext === ".m4v") return "video/mp4";
  if (ext === ".png") return "image/png";
  return "application/octet-stream";
}