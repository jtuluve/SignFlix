"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Edit form aligned to Prisma Video model: title, description?, tags[], category?, thumbnailUrl?, captionUrl?
export default function EditVideoForm({ id }: { id: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // TODO: load video by id via server action or API and set fields
    // For now, leave fields empty
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const tagsArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
      console.log("Updating video", { id, title, description, category, tags: tagsArr });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Video details saved (stub)");
    } catch (error) {
      console.error("Failed to save video details:", error);
      alert("Failed to save video details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">Title</label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter video title" />
          </div>
          <div>
            <label htmlFor="desc" className="block text-sm font-medium mb-2">Description</label>
            <Textarea id="desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell viewers about your video" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-2">Tags</label>
              <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Comma-separated (e.g. asl, tutorial, beginner)" />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">Category</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">Select category</option>
                <option value="EDUCATION">EDUCATION</option>
                <option value="ENTERTAINMENT">ENTERTAINMENT</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
