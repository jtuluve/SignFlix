"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, Video, FileText, CheckCircle, X, Subtitles, Plus, Save, Trash2 } from "lucide-react";
import uploadVideo from "@/lib/uploadVideo";

export type Caption = {
  id: string;
  startTime: string;
  endTime: string;
  text: string;
};

export default function UploadSection() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [captionFile, setCaptionFile] = useState<File | null>(null);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prisma Video model fields (minus videoUrl): title, description?, thumbnailUrl?, captionUrl?, duration?, tags[], category?
  const [metadata, setmetadata] = useState({
    title: "",
    description: "",
    tags: "",
    category: "",
  });

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
      if (file.type.startsWith("video/")) setUploadedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setUploadedFile(e.target.files[0]);
  };


  const handlePublish = async() => {
    if (!uploadedFile) {
      alert("Please select a video file to upload");
      return;
    }
    if(!captionFile){
      alert("please select a caption file to upload");
      return;
    }
  
    setIsPublishing(true);
    try {
      const tags = metadata.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const data = {...metadata,tags}
      console.log(data+'sdjflksadjfaweorfjojfklasjfoijwoiefds')
      await uploadVideo({data, videoFile: uploadedFile, captionFile, thumbnailFile});

      alert("Video submitted (stub). Wire this to your upload + createVideo() server action.");

      // reset
      setUploadedFile(null);
      setThumbnailFile(null);
      setCaptionFile(null);
      setmetadata({ title: "", description: "", tags: "", category: "" });
    } catch (error) {
      console.error("Failed to publish video:", error);
      alert("Failed to publish video. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" /> Upload Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!uploadedFile ? (
            <fieldset
              aria-label="Drag and drop file upload"
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Drag and drop video files to upload</h3>
              <p className="text-gray-600 mb-4">Your videos will be private until you publish them.</p>
              <Button onClick={() => fileInputRef.current?.click()}>Select Files</Button>
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
              <p className="text-xs text-gray-500 mt-4">Supported formats: MP4, MOV, AVI, WMV, FLV, WebM</p>
            </fieldset>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900">{uploadedFile.name}</h4>
                  <p className="text-sm text-green-700">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Video Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title
              </label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => setmetadata({ ...metadata, title: e.target.value })}
                placeholder="Enter video title"
              />
            </div>
            <div>
              <label htmlFor="desc" className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                id="desc"
                value={metadata.description}
                onChange={(e) => setmetadata({ ...metadata, description: e.target.value })}
                placeholder="Tell viewers about your video"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tags" className="block text-sm font-medium mb-2">
                  Tags
                </label>
                <Input
                  id="tags"
                  value={metadata.tags}
                  onChange={(e) => setmetadata({ ...metadata, tags: e.target.value })}
                  placeholder="Comma-separated (e.g. asl, tutorial, beginner)"
                />
                <p className="text-xs text-gray-500 mt-1">Stored as string[]</p>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={metadata.category}
                  onChange={(e) => setmetadata({ ...metadata, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select category</option>
                  <option value="EDUCATION">EDUCATION</option>
                  <option value="ENTERTAINMENT">ENTERTAINMENT</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Thumbnail</label>
                <Input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)} />
                {thumbnailFile && (
                  <Badge variant="secondary" className="mt-2">
                    {thumbnailFile.name}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Subtitles className="w-5 h-5" /> Captions
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
                          <div>
                <label className="block text-sm font-medium mb-2">Caption (.srt)</label>
                <Input type="file" accept=".srt" onChange={(e) => setCaptionFile(e.target.files?.[0] ?? null)} />
                {captionFile && (
                  <Badge variant="secondary" className="mt-2">
                    {captionFile.name}
                  </Badge>
                )}
              </div>
          </CardContent>
        </Card>
      )}

      {uploadedFile && (
        <div className="flex justify-end">
          <Button onClick={handlePublish} size="lg" className="px-8" disabled={isPublishing}>
            {isPublishing ? 'Publishing...' : 'Publish Video'}
          </Button>
        </div>
      )}
    </div>
  );
}

function CaptionEditor({
  captions,
  setCaptions,
  onClose,
}: {
  captions: Caption[];
  setCaptions: (captions: Caption[]) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [newCaption, setNewCaption] = useState({ startTime: "", endTime: "", text: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSRTUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.name.endsWith(".srt")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const parsedCaptions = parseSRT(content);
        setCaptions(parsedCaptions);
      };
      reader.readAsText(file);
    }
  };

  const parseSRT = (content: string): Caption[] => {
    const blocks = content.trim().split("\n\n");
    return blocks.map((block, index) => {
      const lines = block.split("\n");
      const timeMatch = lines[1]?.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
      return {
        id: `caption-${index}`,
        startTime: timeMatch?.[1] || "00:00:00,000",
        endTime: timeMatch?.[2] || "00:00:00,000",
        text: lines.slice(2).join(" "),
      };
    });
  };

  const addCaption = () => {
    if (newCaption.startTime && newCaption.endTime && newCaption.text) {
      setCaptions([...captions, { ...newCaption, id: `caption-${Date.now()}` }]);
      setNewCaption({ startTime: "", endTime: "", text: "" });
    }
  };

  const removeCaption = (id: string) => {
    setCaptions(captions.filter((c) => c.id !== id));
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Caption Editor</DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-2 my-4">
        <Button variant={activeTab === "upload" ? "default" : "outline"} onClick={() => setActiveTab("upload")}>Upload SRT</Button>
        <Button variant={activeTab === "manual" ? "default" : "outline"} onClick={() => setActiveTab("manual")}>Manual Entry</Button>
      </div>

      {activeTab === "upload" ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium mb-2">Upload SRT Caption File</h3>
          <p className="text-sm text-gray-600 mb-4">Upload a .srt file with your video captions</p>
          <Button onClick={() => fileInputRef.current?.click()}>Choose SRT File</Button>
          <input ref={fileInputRef} type="file" accept=".srt" onChange={handleSRTUpload} className="hidden" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="time1" className="block text-sm font-medium mb-2">
                Start Time
              </label>
              <Input id="time1" value={newCaption.startTime} onChange={(e) => setNewCaption({ ...newCaption, startTime: e.target.value })} placeholder="00:00:00,000" />
            </div>
            <div>
              <label htmlFor="time2" className="block text-sm font-medium mb-2">
                End Time
              </label>
              <Input id="time2" value={newCaption.endTime} onChange={(e) => setNewCaption({ ...newCaption, endTime: e.target.value })} placeholder="00:00:05,000" />
            </div>
            <div className="flex items-end">
              <Button type="submit" onClick={addCaption} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
          </div>
          <div>
            <label htmlFor="caption" className="block text-sm font-medium mb-2">
              Caption Text
            </label>
            <Textarea id="caption" value={newCaption.text} onChange={(e) => setNewCaption({ ...newCaption, text: e.target.value })} placeholder="Enter caption text" rows={2} />
          </div>
        </div>
      )}

      {captions.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium mb-4">Captions ({captions.length})</h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {captions.map((caption) => (
              <div key={caption.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-xs font-mono text-gray-500 mb-1">
                    {caption.startTime} → {caption.endTime}
                  </div>
                  <p className="text-sm">{caption.text}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeCaption(caption.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>
          <Save className="w-4 h-4 mr-2" /> Save Captions
        </Button>
      </div>
    </div>
  );
}
