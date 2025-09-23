"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, Video, FileText, CheckCircle, X, Image as ImageIcon, Subtitles, Sparkles } from "lucide-react";
import uploadVideo from "@/lib/uploadVideo";
import { Toaster, toast } from 'sonner';
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function UploadSection() {
  const [dragActive, setDragActive] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [captionFile, setCaptionFile] = useState<File | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [metadata, setMetadata] = useState({
    title: "",
    description: "",
    tags: "",
    category: "",
  });

  useEffect(() => {
    if (videoFile) {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [videoFile]);

  useEffect(() => {
    if (thumbnailFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(thumbnailFile);
    } else {
      setThumbnailPreview(null);
    }
  }, [thumbnailFile]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        setVideoFile(file);
        toast.success("Video selected! Please fill in the details below.");
      } else {
        toast.warning("Invalid file type. Please drop a video file.");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setVideoFile(e.target.files[0]);
      toast.success("Video selected! Please fill in the details below.");
    }
  };

  const handlePublish = async () => {
    if (!videoFile) {
      toast.warning("Please select a video file to upload.");
      return;
    }
    if (!captionFile) {
      toast.warning("Please select a caption file to upload.");
      return;
    }
    if (!metadata.title) {
      toast.warning("Please provide a title for your video.");
      return;
    }

    setIsPublishing(true);
    try {
      const tags = metadata.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const data = { ...metadata, tags };
      await uploadVideo({ data, videoFile, captionFile, thumbnailFile });
      toast.success("Video published successfully!");
      resetForm();
    } catch (error) {
      console.error("Failed to publish video:", error);
      toast.error("Failed to publish video. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const resetForm = () => {
    setVideoFile(null);
    setThumbnailFile(null);
    setCaptionFile(null);
    setMetadata({ title: "", description: "", tags: "", category: "" });
    setUploadProgress(0);
    setThumbnailPreview(null);
  };

  if (!videoFile) {
    return (
      <div className="flex items-center justify-center w-full" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="max-w-4xl w-full">
          <Toaster position="top-right" closeButton />
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300",
              dragActive ? "border-red-500 bg-red-50 scale-105" : "border-gray-300 hover:border-red-300"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-10 h-10 text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold">Drag and drop video files to upload</h2>
              <p className="text-gray-500">Your videos will be private until you publish them.</p>
              <Button size="lg" onClick={() => fileInputRef.current?.click()}>
                Select Files
              </Button>
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Toaster position="top-right" closeButton />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Details</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetForm}>Cancel</Button>
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? 'Publishing...' : 'Publish Video'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
              <CardDescription>Provide a title and description for your video.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">Title (required)</label>
                <Input id="title" value={metadata.title} onChange={(e) => setMetadata({ ...metadata, title: e.target.value })} placeholder="e.g., Learn ASL: Basic Greetings" />
              </div>
              <div>
                <label htmlFor="desc" className="block text-sm font-medium mb-2">Description</label>
                <Textarea id="desc" value={metadata.description} onChange={(e) => setMetadata({ ...metadata, description: e.target.value })} placeholder="Tell viewers about your video" rows={6} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thumbnail</CardTitle>
              <CardDescription>Select or upload a picture that shows what's in your video.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-48 relative aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                {thumbnailPreview ? (
                  <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <Input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Captions</CardTitle>
              <CardDescription>Upload a caption file to make your video accessible.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input type="file" accept=".srt" onChange={(e) => setCaptionFile(e.target.files?.[0] ?? null)} />
              {captionFile && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>{captionFile.name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categorization</CardTitle>
              <CardDescription>Add tags and a category to help viewers find your video.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tags" className="block text-sm font-medium mb-2">Tags</label>
                <Input id="tags" value={metadata.tags} onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })} placeholder="ASL, Tutorial, Beginner" />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">Category</label>
                <Select value={metadata.category} onValueChange={(value) => setMetadata({ ...metadata, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EDUCATION">Education</SelectItem>
                    <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg mb-4">
                {/* In a real app, you'd use a video player here */}
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">{videoFile.name}</p>
                <Progress value={uploadProgress} />
                <p className="text-xs text-gray-500">{uploadProgress === 100 ? "Processing complete" : `Uploading... ${uploadProgress}%`}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}