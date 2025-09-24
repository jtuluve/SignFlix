"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getVideobyId } from "@/utils/video";
import updateVideoContent from "@/lib/updateVideo";
import Link from "next/link";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { UploadedVideo } from "./VideosSection";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditVideoForm({ id }: { id: string }) {
  const [video, setVideo] = useState<UploadedVideo | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const fetchedVideo = await getVideobyId(id);
        if (fetchedVideo) {
          setVideo(fetchedVideo as UploadedVideo);
          setTitle(fetchedVideo.title);
          setDescription(fetchedVideo.description || "");
          setTags(fetchedVideo.tags.join(", "));
          setCategory(fetchedVideo.category || "");
          setThumbnailPreview(fetchedVideo.thumbnailUrl || null);
        }
      } catch (error) {
        toast.error("Failed to load video data.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (thumbnailFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(thumbnailFile);
    }
  }, [thumbnailFile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("tags", tags);
      formData.append("category", category);
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      await updateVideoContent(formData);
      toast.success("Video details saved successfully!");

    } catch (error) {
      console.error("Failed to save video details:", error);
      toast.error("Failed to save video details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <EditFormSkeleton />;
  }

  if (!video) {
    return <div>Video not found.</div>;
  }

  return (
    <div className="space-y-8">
      <Toaster position="top-right" closeButton />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Video</h1>
        <div className="flex items-center gap-4">
          <Link href="/content">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Skeleton className="h-4 w-20" /> : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
              <CardDescription>Edit the title, description, and other details for your video.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title">Title</label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1"/>
              </div>
              <div>
                <label htmlFor="desc">Description</label>
                <Textarea id="desc" rows={8} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1"/>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categorization</CardTitle>
              <CardDescription>Organize your video with tags and a category.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tags">Tags</label>
                <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1" placeholder="ASL, Education, ..."/>
              </div>
              <div>
                <label htmlFor="category">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select a category" /></SelectTrigger>
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
              <CardTitle>Thumbnail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                {thumbnailPreview ? (
                  <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <Input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const EditFormSkeleton = () => (
  <div className="space-y-8">
    <div className="flex items-center justify-between">
      <Skeleton className="h-9 w-48" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="aspect-video rounded-lg mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);