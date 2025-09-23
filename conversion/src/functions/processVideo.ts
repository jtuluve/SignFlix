import { app, InvocationContext } from "@azure/functions";
import { getVideoInfoFromDb, saveResultToDb } from "../helpers/db";
import path = require("path");
import { downloadCaptions, headersAreSame, mergePoseJson, mergeVideos, textToPoseFile } from "../helpers/captions";
import { poseToVideo, poseJsonToVideo } from "pose-to-video";
import { Pose } from "pose-format";
import { timeStringToSeconds } from './../helpers/utils';
import { uploadToBlob } from "../helpers/blob";
import * as fs from "fs";

export async function processVideo(
  videoId: string,
  context: InvocationContext
): Promise<void> {
  try {
    context.log(`Processing videoId: ${videoId}`);

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

    context.log(`Finished processing videoId: ${videoId}`);
  } catch (err) {
    context.error("Error processing video:", err);
    throw err;
  }
}

app.storageQueue("processVideo", {
  queueName: "videos",
  connection: "signflixvideoqueue_STORAGE",
  handler: processVideo,
});
