"use client";

import React, {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { newExtract } from "@/lib/newExtract";
import { Prisma } from "@prisma/client";

type CaptionType = {
  id: number;
  start: string;
  end: string;
  text: string;
};

type WatchViewProps = {
  videoUrl?: string | "/test.mp4";
  captionUrl?: string | null;
  posterUrl?: string | null;
  video?: Prisma.VideoCreateInput;

  signVideoUrl?: string | "/test.mp4";
  signCaptionUrl?: string | null;
  initialSpeed?: number;
  syncMode: "adjust" | "pause";
};

export default function WatchView({
  videoUrl,
  captionUrl,
  posterUrl,
  signVideoUrl,
  signCaptionUrl,
  initialSpeed = 1.0,
  syncMode,
  video,
}: WatchViewProps) {
  const hasVideo = Boolean(videoUrl);
  const hasSignVideo = Boolean(signVideoUrl);

  const mainRef = useRef<HTMLVideoElement | null>(null);
  const signRef = useRef<HTMLVideoElement | null>(null);

  const [speed, setSpeed] = useState<string>(() => `${initialSpeed}`);
  const numericSpeed = useMemo(() => Number.parseFloat(speed) || 1.0, [speed]);
  const [captions, setCaptions] = useState<CaptionType[]>([]);
  const [currentCaption, setCurrentCaption] = useState<string>("");
  const [_poseData, setPoseData] = useState<string | null>(null);

  const [_mainTime, setMainTime] = useState<number>(0);

  const [simOffset, setSimOffset] = useState<number>(0);

  const prevCaptionRef = useRef<string>("");
  const poseUrlRef = useRef<string | null>(null);

  const fetchPoseData = useCallback(
    async (caption: string): Promise<string | null> => {
      console.log("Fetching pose data for caption:", caption);
      if (!caption) return null;
      try {
        const response = await fetch(
          `https://us-central1-sign-mt.cloudfunctions.net/spoken_text_to_signed_pose?text=${encodeURI(
            caption
          )}&spoken=en&signed=ase`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch pose file");
        }

        const poseFileBlob = await response.blob();

        if (poseUrlRef.current) {
          URL.revokeObjectURL(poseUrlRef.current);
        }

        const fileUrl = URL.createObjectURL(poseFileBlob);
        poseUrlRef.current = fileUrl;

        return fileUrl;
      } catch (error) {
        console.error("Error fetching pose data:", error);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      if (poseUrlRef.current) {
        URL.revokeObjectURL(poseUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const main = mainRef.current;
    const sign = signRef.current;
    const targetRate = syncMode === "adjust" ? numericSpeed : 1.0;
    if (main) main.playbackRate = targetRate;
    if (sign) sign.playbackRate = targetRate;
  }, [syncMode, numericSpeed]);

  const timeStringToSeconds = useCallback((timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(":");
    const [sec, ms] = seconds.split(",");
    return (
      Number.parseInt(hours) * 3600 +
      Number.parseInt(minutes) * 60 +
      Number.parseInt(sec) +
      Number.parseInt(ms) / 1000
    );
  }, []);

  useEffect(() => {
    let captionJson = [];
    let currentTime = 0;
    let getCaption;
    let poseJson;

    (async () => {
      if (captionUrl) {
        captionJson = await newExtract(captionUrl);
      }
      poseJson = await fetch(video.signTimeUrl).then((res) => res.json());
      console.log(poseJson);
      (Array.from(poseJson) as any)?.forEach((element) => fetch(element.poseUrl));
    })();

    let getCaptionInterval = setInterval(async () => {
      currentTime = mainRef.current?.currentTime || 0;
      getCaption = captionJson?.find(
        (element) => element.start <= currentTime && element.end >= currentTime
      );
      let pose = (Array.from(poseJson) as any)?.find((element) => element.sequence == getCaption.id);
      if (pose) {
        setPoseData(pose.poseUrl);
      }
    }, 1000);
    return () => clearInterval(getCaptionInterval);
  }, []);

  const findCurrentCaption = useCallback(
    (
      currentTime: number,
      captionsC: CaptionType[]
    ): CaptionType | undefined => {
      return captionsC.find((caption) => {
        const startTime = timeStringToSeconds(caption.start);
        const endTime = timeStringToSeconds(caption.end);
        return currentTime >= startTime && currentTime <= endTime;
      });
    },
    [timeStringToSeconds]
  );

  useEffect(() => {
    const main = mainRef.current;
    const sign = signRef.current;
    if (!main) return;

    let raf = 0;
    const DRIFT_THRESHOLD = 0.25;
    let lastCaptionTime = -1;

    const tick = async () => {
      const t = main.currentTime || 0;
      setMainTime(t);

      if (
        captionUrl &&
        captions.length > 0 &&
        Math.abs(t - lastCaptionTime) > 0.1
      ) {
        lastCaptionTime = t;
        const caption = findCurrentCaption(t, captions);
        const newCaptionText = caption?.text || "";

        if (newCaptionText !== prevCaptionRef.current) {
          prevCaptionRef.current = newCaptionText;
          setCurrentCaption(newCaptionText);

          if (newCaptionText) {
            const poseFileData = await fetchPoseData(newCaptionText);
            if (poseFileData) {
              setPoseData(poseFileData);
            }
          } else {
            setPoseData(null);
          }
        }
      }

      if (sign) {
        const desired = t + simOffset;
        const current = sign.currentTime || 0;
        const drift = desired - current;
        if (Math.abs(drift) > DRIFT_THRESHOLD) {
          sign.currentTime = Math.max(0, desired);
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [captionUrl, captions, findCurrentCaption, simOffset, fetchPoseData]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!mainRef.current || !signRef.current) return;

      if (document.fullscreenElement === mainRef.current) {
        if (signRef.current && document.pictureInPictureEnabled) {
          signRef.current.requestPictureInPicture();
        }
      } else if (document.fullscreenElement === signRef.current) {
        if (mainRef.current && document.pictureInPictureEnabled) {
          mainRef.current.requestPictureInPicture();
        }
      } else {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture();
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="aspect-video rounded-lg overflow-hidden relative border bg-background">
          {captionUrl && captions.length > 0 ? (
            <>
              <div className="absolute inset-x-0 top-0 bg-black/40 text-white text-xs px-3 py-1">
                {"Pose Simulation — synchronized with captions"}
              </div>
              {currentCaption && (
                <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs px-3 py-2">
                  {currentCaption}
                </div>
              )}
            </>
          ) : _poseData ? (
            createElement("pose-viewer", {
              className: "w-full h-full",
              src: _poseData,
              "aria-label": "Sign language pose viewer",
              loop: "true",
              renderer: "svg",
              suppressHydrationWarning: true,
            })
          ) : (
            <>
              <Image
                src="/placeholder.svg?height=720&width=1280"
                alt="Sign simulation unavailable"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs px-3 py-2">
                {"Sign Language Simulation (no video available)"}
              </div>
            </>
          )}
        </div>

        <div className="aspect-video rounded-lg overflow-hidden bg-black relative">
          {hasVideo ? (
            <React.Fragment>
              <video
                ref={mainRef}
                className="w-full h-full"
                controls
                preload="metadata"
                playsInline
                poster={posterUrl ?? undefined}
                aria-label="Main source video"
              >
                <source src={videoUrl} type="video/mp4" />
                <track
                  src={captionUrl || undefined}
                  kind="captions"
                  srcLang="en"
                  label="English"
                  default
                />
              </video>
              {!captionUrl && (
                <div className="text-xs text-red-600">
                  No captions available for this video.
                </div>
              )}
              <div>{"Your browser does not support the video tag!"}</div>
            </React.Fragment>
          ) : (
            <>
              <Image
                src={
                  posterUrl ||
                  "/placeholder.svg?height=720&width=1280&query=video%20placeholder" ||
                  "/placeholder.svg"
                }
                alt="Video unavailable"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover opacity-80"
                priority
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-md bg-black/60 text-white px-4 py-2 text-sm">
                  {"Video unavailable in this draft"}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
