"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfileSection() {
  const { data: session } = useSession();

  // Extract initial user details from session
  const initialUser = {
    username: session?.user?.name || "",
    email: session?.user?.email || "",
    bio: (session?.user as any)?.bio || "No Bio",
    avatarUrl: (session?.user as any)?.avatarUrl || "",
  };

  const [username, setUsername] = useState(initialUser.username);
  const [email, setEmail] = useState(initialUser.email);
  const [bio, setBio] = useState(initialUser.bio);
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl);
  const [isEditing, setIsEditing] = useState(false);

  console.log(session);

  const handleSave = () => {
    console.log("Saving profile (schema-aligned)", { username, email, bio, avatarUrl });
    alert("Profile saved (stub)");
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Profile</CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
            <div className="space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={username} />
              ) : (
                <AvatarFallback className="bg-gray-200 text-black text-xl font-semibold">
                  {username ? username[0].toUpperCase() : "?"}
                </AvatarFallback>
              )}
            </Avatar>
            {isEditing && (
              <Input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Avatar image URL"
              />
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block font-medium mb-2">
              Email :
              <span className="text-gray-800 ml-5 text-sm">{email}</span>
            </label>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block font-medium mb-2">
              {isEditing ? "Username" : "Name"}
            </label>
            {isEditing ? (
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_handle"
              />
            ) : (
              <p className="text-gray-800 text-sm">{username}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block font-medium mb-2">
              Bio
            </label>
            {isEditing ? (
              <Textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell viewers about yourself"
              />
            ) : (
              <p className="text-gray-800 text-sm whitespace-pre-line">{bio || "—"}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
