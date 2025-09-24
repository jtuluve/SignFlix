import { QueueServiceClient } from "@azure/storage-queue";
import { getVideoInfoFromDb, saveResultToDb } from "./helpers/db";
import path = require("path");
import { downloadCaptions, textToPoseFile } from "./helpers/captions";
import { uploadToBlob } from "./helpers/blob";
import * as fs from "fs";
import convertToASL from "./gemini.js";

const QUEUE_NAME = process.env.VIDEO_QUEUE_NAME || "videos";

async function processSingleVideo(videoId: string): Promise<void> {
  try {
    console.log(`Processing videoId: ${videoId}`);

    const videoInfo = await getVideoInfoFromDb(videoId);
    console.log(`[${videoId}] Fetched video info from DB.`);
    const captions = await downloadCaptions(videoInfo.captionUrl);
    console.log(`[${videoId}] Downloaded captions.`);

    const poseSequence = [];
    if(!fs.existsSync("./poses")){
      fs.mkdirSync("./poses");
    }

    for (const caption of captions) {
      caption.caption = await convertToASL(caption.caption);
      // 1. Caption -> Pose file
      const poseFile = await textToPoseFile(caption.caption);
      const posePath = path.join("./poses", `pose_${caption.sequence}.pose`);
      fs.writeFileSync(posePath, poseFile);
      console.log(`[${videoId}] Wrote pose file for sequence ${caption.sequence} to ${posePath}.`);

      // 2. Upload pose file to blob
      const poseUrl = await uploadToBlob("poses", posePath);
      console.log(`[${videoId}] Uploaded pose file for sequence ${caption.sequence} to blob: ${poseUrl}.`);

      // 3. Add to sequence
      poseSequence.push({
        sequence: caption.sequence,
        poseUrl: poseUrl,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 4. Save pose sequence to json file
    const jsonPath = path.join("./poses", `pose_sequence_${videoId}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(poseSequence, null, 2));
    console.log(`[${videoId}] Wrote pose sequence JSON to ${jsonPath}.`);

    // 5. Upload json to blob
    const jsonUrl = await uploadToBlob("results", jsonPath);
    console.log(`[${videoId}] Uploaded pose sequence JSON to blob: ${jsonUrl}.`);

    // 6. Save to DB
    await saveResultToDb(videoId, jsonUrl);
    console.log(`[${videoId}] Saved result to DB.`);

    console.log(`Finished processing videoId: ${videoId}`);
  } catch (err) {
    console.error("Error processing video:", err);
    throw err;
  }
}

export async function processVideoFromQueue(): Promise<void> {
  const CONNECTION_STRING = process.env.AZURE_QUEUE_CONNECTION_STRING;
  if (!CONNECTION_STRING) {
    console.error("AZURE_QUEUE_CONNECTION_STRING is not set.");
    return;
  }

  const queueServiceClient = QueueServiceClient.fromConnectionString(CONNECTION_STRING);
  const queueClient = queueServiceClient.getQueueClient(QUEUE_NAME);

  try {
    // Ensure the queue exists
    await queueClient.createIfNotExists();

    // Peek messages to see if there are any
    const peekedMessages = await queueClient.peekMessages({ numberOfMessages: 1 });
    if (peekedMessages.peekedMessageItems.length === 0) {
      console.log("No messages in the queue.");
      return;
    }

    // Receive messages
    const response = await queueClient.receiveMessages({});

    for (const message of response.receivedMessageItems) {
      try {
        const videoId = message.messageText; // Assuming messageText is the videoId
        await processSingleVideo(videoId);
        await queueClient.deleteMessage(message.messageId, message.popReceipt);
        console.log(`Successfully processed and deleted message for videoId: ${videoId}`);
      } catch (error) {
        console.error(`Failed to process message for videoId: ${message.messageText}`, error);
        // Depending on the error, you might want to re-queue the message or move it to a poison queue
      }
    }
  } catch (error) {
    console.error("Error interacting with Azure Storage Queue:", error);
  }
}