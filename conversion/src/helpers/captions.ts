import { Pose } from "pose-format";
import * as fs from "fs";
import path = require("path");
import * as os from "os"
import { spawn } from "child_process";

export type srt = {
  sequence: number;
  start_time: string;
  end_time: string;
  caption: string;
};

export async function downloadCaptions(captionUrl: string): Promise<srt[]> {
  const response = await fetch(captionUrl);
  const inputSrt = await response.text();
  const srtString = inputSrt.replace(/\r/g, "").split("\n\n");

  return srtString
    .map((item) => {
      const regex = /(\d+)\n([\d:,]+)\s*-+>\s*([\d:,]+)(?:\n([\S\s]*))?/g;
      const match = regex.exec(item);
      if (match === null) {
        console.log("Invalid SRT format:", item);
        return;
      }
      const sequence = parseInt(match[1]);
      const start_time = match[2].trim();
      const end_time = match[3].trim();
      const caption = match[4]?.trim() || "";
      return { sequence, start_time, end_time, caption };
    })
    .filter((v) => v !== undefined);
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
  const res = await fetch(
    `${process.env.API_URL}?text=${encodeURI(text)}&spoken=en&signed=ase`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch pose file");
  }

  const poseFileBlob = Buffer.from(await res.arrayBuffer());

  return poseFileBlob;
}

export function mergePoseJson(dest: any, src: any): any {
  if (!dest || !src) throw new Error("dest and src required");
  if (!headersAreSame(dest, src)) throw new Error("Pose headers incompatible for merge");

  dest.body.frames = dest.body.frames.concat(src.body.frames || []);
  dest.body._frames = dest.body.frames.length;

  return dest;
}

export async function mergeVideos(videoPaths: string[], outputPath: string): Promise<void> {
  if (!videoPaths || videoPaths.length === 0) {
    throw new Error("No videos to merge");
  }
  if (videoPaths.length === 1) {
    // Just copy the single file
    fs.copyFileSync(videoPaths[0], outputPath);
    return;
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ffmerge-"));
  const listPath = path.join(tmpDir, "inputs.txt");
  const data = videoPaths.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
  fs.writeFileSync(listPath, data, "utf8");

  const ff = "ffmpeg";
  await execCommand(ff, ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", outputPath], { timeout: 60 * 60_000 });

  // cleanup
  try { fs.unlinkSync(listPath); } catch (e) {}
  try { fs.rmdirSync(tmpDir); } catch (e) {}
}

function execCommand(cmd: string, args: string[], options: { timeout?: number } = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit" });
    const to = options.timeout ?? 0;
    let timedOut = false;
    let timer: NodeJS.Timeout | undefined;
    if (to > 0) {
      timer = setTimeout(() => {
        timedOut = true;
        p.kill("SIGKILL");
      }, to);
    }
    p.on("error", err => {
      if (timer) clearTimeout(timer);
      reject(err);
    });
    p.on("exit", code => {
      if (timer) clearTimeout(timer);
      if (timedOut) return reject(new Error("Process timed out"));
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}