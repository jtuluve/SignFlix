"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ProfileSection() {
  // Prisma User model fields: username, email, bio?, avatarUrl?
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleSave = () => {
    console.log("Saving profile (schema-aligned)", { username, email, bio, avatarUrl });
    alert("Profile saved (stub)");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">Username</label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_handle" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">Bio</label>
            <Textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell viewers about yourself" />
          </div>
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium mb-2">Avatar URL</label>
            <Input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
