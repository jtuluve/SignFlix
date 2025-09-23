"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import updateUserProfile from "@/lib/updateuser";
import { getUserByEmail } from "@/utils/user";
import { Toaster, toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ProfileSection() {
  const { data: session } = useSession();


  const [username, setUsername] = useState(session?.user?.username || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [bio, setBio] = useState((session?.user as any)?.bio || "No Bio");
  const [isEditing, setIsEditing] = useState(false);


  const handleSave = () => {
    updateUserProfile({ username, bio });
    toast("Profile saved");
    setIsEditing(false);
  };

  useEffect(()=>{
    (async()=>{
        const user = await getUserByEmail(session.user.email);
        setUsername(user?.username || "");
        setBio(user?.bio || "No Bio");
    })()
  },[]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Toaster position="top-right" closeButton />
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
                <AvatarFallback className="bg-gray-200 text-black text-xl font-semibold">
                  {username ? username[0].toUpperCase() : "?"}
                </AvatarFallback>
            </Avatar>
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
              {isEditing ? "Username" : ""}
            </label>
            {isEditing ? (
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_handle"
              />
            ) : (
              <p className="text-gray-800">{username}</p>
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
