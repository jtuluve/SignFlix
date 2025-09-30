"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import updateUserProfile from "@/lib/updateuser";
import { getUserByEmail } from "@/utils/user";
import { Toaster, toast } from 'sonner';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import uploadBanner from "@/lib/uploadBanner";

export default function ProfileSection() {
    const { data: session, update } = useSession();

    const [username, setUsername] = useState(session?.user?.username || "");
    const [email, setEmail] = useState(session?.user?.email || "");
    const [bio, setBio] = useState((session?.user as any)?.bio || "No Bio");
    const [description, setDescription] = useState((session?.user as any)?.description || "");
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [bannerUrl, setBannerUrl] = useState((session?.user as any)?.bannerUrl || "");
    const [isEditing, setIsEditing] = useState(false);
    const [subscribers, setSubscribers] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        (async () => {
            const user = await getUserByEmail(session.user.email);
            setUsername(user?.username || "");
            setBio(user?.bio || "No Bio");
            setDescription(user?.description || "");
            setBannerUrl(user?.bannerUrl || "");
            setSubscribers(user?.subscribersCount || 0);
        })()
    }, [session]);

    useEffect(() => {
        if (bannerFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerPreview(reader.result as string);
            };
            reader.readAsDataURL(bannerFile);
        } else {
            setBannerPreview(null);
        }
    }, [bannerFile]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let newBannerUrl = bannerUrl;
            if (bannerFile) {
                newBannerUrl = await uploadBanner(bannerFile);
            }
            await updateUserProfile({ username, bio, description, bannerUrl: newBannerUrl });
            await update({ ...session, user: { ...session?.user, username, bio, description, bannerUrl: newBannerUrl } });
            toast.success("Profile saved");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to save profile");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
            <Toaster position="top-right" closeButton />
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
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
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center md:items-start space-y-4">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={session?.user?.image || ""} />
                            <AvatarFallback className="bg-muted text-xl font-semibold">
                                {username ? username[0].toUpperCase() : "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-semibold">{username}</h3>
                            <p className="text-sm text-muted-foreground">{email}</p>
                            <p className="text-sm text-muted-foreground">{subscribers} Subscribers</p>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="your_handle"
                                disabled={!isEditing}
                            />
                        </div>

                        <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                rows={5}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell viewers about yourself"
                                disabled={!isEditing}
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Channel Description</Label>
                            <Textarea
                                id="description"
                                rows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your channel to viewers"
                                disabled={!isEditing}
                            />
                        </div>

                        <div>
                            <Label htmlFor="banner">Channel Banner</Label>
                            <Input
                                id="banner"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
                                disabled={!isEditing}
                            />
                            {(bannerPreview || bannerUrl) && (
                                <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden">
                                    <img src={bannerPreview || bannerUrl} alt="Banner preview" className="object-cover w-full h-full" />
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}