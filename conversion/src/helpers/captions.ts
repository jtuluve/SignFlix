import { Pose } from "pose-to-video/src/pose-format";
import * as fs from "fs";
import path = require("path");
import * as os from "os";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";
import parseSRT from "parse-srt";
// import fetch from "node-fetch";

export type srt = {
  sequence: number;
  start_time: string;
  end_time: string;
  caption: string;
};

export async function downloadCaptions(captionUrl: string): Promise<srt[]> {
  const response = await fetchWithRetry(captionUrl);
  const inputSrt = await response.text();

  return parseSRT(inputSrt).map((srt)=>{
    return {
      sequence: srt.id,
      start_time: srt.start,
      end_time: srt.end,
      caption: srt.text
    }
  });
}

export function headersAreSame(a: Pose, b: Pose): boolean {
  if (!a?.header || !b?.header) return false;

  // Compare relevant fields: version, width, height, components length, fps (in body)
  if (a.header.version !== b.header.version) return false;
  if (a.header.width !== b.header.width) return false;
  if (a.header.height !== b.header.height) return false;
  if ((a.header.components?.length || 0) !== (b.header.components?.length || 0))
    return false;

  // Compare each component's point count, limbs length and names
  for (let i = 0; i < (a.header.components?.length || 0); i++) {
    const ca = a.header.components[i];
    const cb = b.header.components[i];
    if (!ca || !cb) return false;
    if (ca._points !== cb._points) return false;
    if ((ca.limbs?.length || 0) !== (cb.limbs?.length || 0)) return false;
    if (ca.name !== cb.name) return false;
  }

  // fps must match
  if ((a.body?.fps || 0) !== (b.body?.fps || 0)) return false;

  return true;
}

export async function textToPoseFile(text: string) {
  const res = await fetchWithRetry(
    `${process.env.API_URL}/spoken_text_to_signed_pose?text=${encodeURI(
      text
    )}&spoken=en&signed=ase`
  );
  if (!res.ok) {
    console.log(res);
    throw new Error("Failed to fetch pose file");
  }

  const poseFileBlob = Buffer.from(await res.arrayBuffer());

  return poseFileBlob;
}

export function mergePoseJson(dest: Pose, src: Pose): any {
  if (!dest || !src) throw new Error("dest and src required");
  if (!headersAreSame(dest, src))
    throw new Error("Pose headers incompatible for merge");
  for (let i=0;i<src.body.frames.length;i++) {
    dest.body.frames.push(src.body.frames[i]);
  }
  dest.body._frames = dest.body.frames.length;

  return dest;
}

export async function mergeVideos(
  videoPaths: string[],
  outputPath: string
): Promise<void> {
  if (!videoPaths || videoPaths.length === 0) {
    throw new Error("No videos to merge");
  }
  if (videoPaths.length === 1) {
    // Just copy the single file
    fs.copyFileSync(videoPaths[0], outputPath);
    return;
  }

  console.log("Merging videos...")

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ffmerge-"));
  const listPath = path.join(tmpDir, "inputs.txt");
  const data = videoPaths
    .map((p) => `file '${p.replace(/'/g, "'\\''")}'`)
    .join("\n");
  fs.writeFileSync(listPath, data, "utf8");

  const ff = ffmpegPath || "ffmpeg";
  await execCommand(
    ff,
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listPath,
      "-c",
      "copy",
      outputPath,
    ],
    { timeout: 60 * 60_000 }
  );

  // cleanup
  try {
    fs.unlinkSync(listPath);
  } catch (e) {}
  try {
    fs.rmdirSync(tmpDir);
  } catch (e) {}
}

async function fetchWithRetry(url: string, options: any = {}, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response;
    } catch (error) {
      console.log(`Attempt ${i + 1} failed. Retrying in ${delay / 1000} seconds...`);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

async function execCommand(
  cmd: string,
  args: string[],
  options: { timeout?: number } = {  timeout: 1000 }
): Promise<void> {
  let attempts = 0;
  const maxAttempts = 5;
  const delay = 1000; // 1 second

  while (attempts < maxAttempts) {
    try {
      return await new Promise((resolve, reject) => {
        const p = spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
        const to = options.timeout ?? 0;
        let timedOut = false;
        let timer: NodeJS.Timeout | undefined;
        if (to > 0) {
          timer = setTimeout(() => {
            timedOut = true;
            p.kill("SIGKILL");
          }, to);
        }
        p.on("error", (err) => {
          if (timer) clearTimeout(timer);
          reject(err);
        });
        p.on("exit", (code) => {
          if (timer) clearTimeout(timer);
          if (timedOut) return reject(new Error("Process timed out"));
          if (code === 0) resolve();
          else reject(new Error(`${cmd} exited with code ${code}`));
        });
      });
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw error;
      }
      console.log(
        `Attempt ${attempts} failed. Retrying in ${delay / 1000} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
