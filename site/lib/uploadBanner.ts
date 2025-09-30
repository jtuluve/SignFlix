import { BlobServiceClient } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const account = process.env.AZURE_STORAGE_ACCOUNT;
const sasToken = process.env.AZURE_BLOB_SAS_TOKEN;

export default async function uploadBanner(bannerFile: File): Promise<string> {
  try {
    const blobServiceClient = new BlobServiceClient(
      `https://${account}.blob.core.windows.net/?${sasToken}`
    );
    const containerName = "banners";
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: "container" });

    const blobName = `${uuidv4()}-${path.basename(bannerFile.name)}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const buffer = Buffer.from(await bannerFile.arrayBuffer());
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: bannerFile.type },
    });

    return blockBlobClient.url;
  } catch (e) {
    console.error("Failed to upload banner:", e);
    throw e;
  }
}