import { QueueServiceClient } from "@azure/storage-queue";
import { getVideoInfoFromDb, saveResultToDb } from "./helpers/db";
import path = require("path");
import { downloadCaptions, headersAreSame, mergePoseJson, mergeVideos, textToPoseFile } from "./helpers/captions";
import { poseToVideo, poseJsonToVideo } from "pose-to-video";
import { Pose } from "pose-to-video/src/pose-format";
import { timeStringToSeconds } from './helpers/utils';
import { uploadToBlob } from "./helpers/blob";
import * as fs from "fs";

const CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const QUEUE_NAME = process.env.VIDEO_QUEUE_NAME || "videos";

async function processSingleVideo(videoId: string): Promise<void> {
  try {
    console.log(`Processing videoId: ${videoId}`);

    const videoInfo = await getVideoInfoFromDb(videoId);
    const captions = await downloadCaptions(videoInfo.captionUrl);

    let mergedPoseJson: Pose = null;
    const generatedVideos: string[] = [];
    const timingJson: Array<{ start_time: number; end_time: number; videoPath: string }> =
      [];

    for (const caption of captions) {
      // 1. Caption -> Pose file
      const poseFile = await textToPoseFile(caption.caption);

      // 2. Pose file -> JSON
      const poseJson = Pose.from(poseFile);

      if (mergedPoseJson && headersAreSame(mergedPoseJson, poseJson)) {
        // merge if same header
        mergedPoseJson = mergePoseJson(mergedPoseJson, poseJson);
      } else {
        // convert previous mergedPoseJson into video if exists
        if (mergedPoseJson) {
          const videoPath = path.join("/tmp", `pose_${Date.now()}.mp4`);
          await poseToVideo(mergedPoseJson, videoPath);
          generatedVideos.push(videoPath);
          timingJson.push({
            start_time: timeStringToSeconds(caption.start_time),
            end_time: timeStringToSeconds(caption.end_time),
            videoPath,
          });
        }
        mergedPoseJson = poseJson;
      }
    }

    // flush last one
    if (mergedPoseJson) {
      const videoPath = path.join("/tmp", `pose_${Date.now()}.mp4`);
      await poseJsonToVideo(mergedPoseJson, videoPath);
      generatedVideos.push(videoPath);
      timingJson.push({
        start_time: timeStringToSeconds(captions[captions.length - 1].start_time),
        end_time: timeStringToSeconds(captions[captions.length - 1].end_time),
        videoPath,
      });
    }

    // Merge videos
    const finalVideoPath = path.join("/tmp", `final_${videoId}.mp4`);
    await mergeVideos(generatedVideos, finalVideoPath);

    // Save timing.json
    const timingPath = path.join("/tmp", `timing_${videoId}.json`);
    fs.writeFileSync(timingPath, JSON.stringify(timingJson, null, 2));

    // Upload results
    const videoUrl = await uploadToBlob("results", finalVideoPath);
    const timingJsonUrl = await uploadToBlob("results", timingPath);

    // Save to DB
    await saveResultToDb(videoId, videoUrl, timingJsonUrl);

    console.log(`Finished processing videoId: ${videoId}`);
  } catch (err) {
    console.error("Error processing video:", err);
    throw err;
  }
}

export async function processVideoFromQueue(): Promise<void> {
  if (!CONNECTION_STRING) {
    console.error("AZURE_STORAGE_CONNECTION_STRING is not set.");
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
    const response = await queueClient.receiveMessages({ numberOfMessages: 1 }); // Process one message at a time

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
