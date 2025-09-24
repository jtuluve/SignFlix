import parseSRT from "parse-srt";
import fetch from "node-fetch";

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