"use client"

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, Video, FileText, Eye, Edit, Trash2, Plus, Save, X, BarChart3, Users, Clock, CheckCircle, Camera, Subtitles, Heart, MessageCircle, Calendar, User, Mail, Bell, Shield, Palette, Globe, Settings } from 'lucide-react';
import Image from 'next/image';
import UploadSection from './sections/UploadSection';
import VideosSection from './sections/VideosSection';
import AnalyticsSection from './sections/AnalyticsSection';
import ProfileSection from './sections/ProfileSection';

interface Caption {
    id: string;
    startTime: string;
    endTime: string;
    text: string;
}

interface UploadedVideo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    duration: string;
    uploadDate: string;
    status: 'processing' | 'published' | 'draft' | 'private';
    views: string;
    likes: string;
    comments: string;
    captions: Caption[];
}

const Studio = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('upload');

    useEffect(() => {
        if (status === 'loading') return; // Still loading
        if (!session) {
            router.push('/'); // Redirect to home if not authenticated
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Camera className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null; // This will not render while redirecting
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                                <Camera className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold">SignFlix Studio</h1>
                        </div>
                        <Badge variant="secondary">Creator Dashboard</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            {session.user?.image && (
                                <Image
                                    src={session.user.image}
                                    alt="Profile"
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                            )}
                            <div className="text-sm text-gray-600">
                                Welcome back, <span className="font-medium">{session.user?.name || 'Creator'}</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => signOut({ callbackUrl: '/' })}
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <div className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 max-w-md">
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                        <TabsTrigger value="videos">My Videos</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="mt-6">
                        <UploadSection />
                    </TabsContent>

                    <TabsContent value="videos" className="mt-6">
                        <VideosSection />
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-6">
                        <AnalyticsSection />
                    </TabsContent>

                    <TabsContent value="profile" className="mt-6">
                        <ProfileSection />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

// const ProfileSection = ({ session }: { session: any }) => {
//     const [profileData, setProfileData] = useState({
//         displayName: session.user?.name || '',
//         email: session.user?.email || '',
//         bio: '',
//         website: '',
//         location: '',
//         profileImage: session.user?.image || '',
//     });

//     const [preferences, setPreferences] = useState({
//         emailNotifications: true,
//         pushNotifications: false,
//         publicProfile: true,
//         showEmail: false,
//         autoplayVideos: true,
//         darkMode: false,
//     });

//     const [stats] = useState({
//         joinDate: '2024-01-01',
//         totalVideos: 24,
//         totalViews: '234K',
//         subscribers: '12.5K',
//         totalLikes: '45.2K',
//     });

//     const handleProfileUpdate = () => {
//         // Handle profile update logic here
//         console.log('Updating profile:', profileData);
//         alert('Profile updated successfully!');
//     };

//     const handlePreferencesUpdate = () => {
//         // Handle preferences update logic here
//         console.log('Updating preferences:', preferences);
//         alert('Preferences updated successfully!');
//     };

//     return (
//         <div className="max-w-4xl mx-auto space-y-6">
//             {/* Profile Overview */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <User className="w-5 h-5" />
//                         Profile Overview
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="flex items-start gap-6">
//                         <div className="relative">
//                             <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
//                                 {profileData.profileImage ? (
//                                     <Image
//                                         src={profileData.profileImage}
//                                         alt="Profile"
//                                         width={96}
//                                         height={96}
//                                         className="object-cover w-full h-full"
//                                     />
//                                 ) : (
//                                     <div className="w-full h-full flex items-center justify-center bg-gray-300">
//                                         <User className="w-8 h-8 text-gray-600" />
//                                     </div>
//                                 )}
//                             </div>
//                             <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full p-2">
//                                 <Camera className="w-3 h-3" />
//                             </Button>
//                         </div>
//                         <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
//                             <div>
//                                 <p className="text-2xl font-bold text-blue-600">{stats.totalVideos}</p>
//                                 <p className="text-sm text-gray-600">Videos</p>
//                             </div>
//                             <div>
//                                 <p className="text-2xl font-bold text-green-600">{stats.totalViews}</p>
//                                 <p className="text-sm text-gray-600">Total Views</p>
//                             </div>
//                             <div>
//                                 <p className="text-2xl font-bold text-purple-600">{stats.subscribers}</p>
//                                 <p className="text-sm text-gray-600">Subscribers</p>
//                             </div>
//                             <div>
//                                 <p className="text-2xl font-bold text-red-600">{stats.totalLikes}</p>
//                                 <p className="text-sm text-gray-600">Total Likes</p>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="mt-4 p-4 bg-gray-50 rounded-lg">
//                         <p className="text-sm text-gray-600">
//                             <Calendar className="w-4 h-4 inline mr-2" />
//                             Member since {new Date(stats.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
//                         </p>
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Edit Profile */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <Edit className="w-5 h-5" />
//                         Edit Profile
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <Label htmlFor="displayName">Display Name</Label>
//                             <Input
//                                 id="displayName"
//                                 value={profileData.displayName}
//                                 onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
//                                 placeholder="Your display name"
//                             />
//                         </div>
//                         <div>
//                             <Label htmlFor="email">Email</Label>
//                             <Input
//                                 id="email"
//                                 type="email"
//                                 value={profileData.email}
//                                 onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
//                                 placeholder="your@email.com"
//                             />
//                         </div>
//                     </div>
                    
//                     <div>
//                         <Label htmlFor="bio">Bio</Label>
//                         <Textarea
//                             id="bio"
//                             value={profileData.bio}
//                             onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
//                             placeholder="Tell viewers about yourself and your channel"
//                             rows={3}
//                         />
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <Label htmlFor="website">Website</Label>
//                             <Input
//                                 id="website"
//                                 value={profileData.website}
//                                 onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
//                                 placeholder="https://your-website.com"
//                             />
//                         </div>
//                         <div>
//                             <Label htmlFor="location">Location</Label>
//                             <Input
//                                 id="location"
//                                 value={profileData.location}
//                                 onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
//                                 placeholder="Your location"
//                             />
//                         </div>
//                     </div>

//                     <Button onClick={handleProfileUpdate} className="w-full md:w-auto">
//                         <Save className="w-4 h-4 mr-2" />
//                         Save Profile Changes
//                     </Button>
//                 </CardContent>
//             </Card>

//             {/* Privacy & Preferences */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <Settings className="w-5 h-5" />
//                         Privacy & Preferences
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                     <div>
//                         <h4 className="font-medium mb-4 flex items-center gap-2">
//                             <Bell className="w-4 h-4" />
//                             Notification Settings
//                         </h4>
//                         <div className="space-y-3">
//                             <div className="flex items-center justify-between">
//                                 <Label htmlFor="emailNotifications">Email notifications</Label>
//                                 <Switch
//                                     id="emailNotifications"
//                                     checked={preferences.emailNotifications}
//                                     onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
//                                 />
//                             </div>
//                             <div className="flex items-center justify-between">
//                                 <Label htmlFor="pushNotifications">Push notifications</Label>
//                                 <Switch
//                                     id="pushNotifications"
//                                     checked={preferences.pushNotifications}
//                                     onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     <div>
//                         <h4 className="font-medium mb-4 flex items-center gap-2">
//                             <Shield className="w-4 h-4" />
//                             Privacy Settings
//                         </h4>
//                         <div className="space-y-3">
//                             <div className="flex items-center justify-between">
//                                 <Label htmlFor="publicProfile">Public profile</Label>
//                                 <Switch
//                                     id="publicProfile"
//                                     checked={preferences.publicProfile}
//                                     onCheckedChange={(checked) => setPreferences({ ...preferences, publicProfile: checked })}
//                                 />
//                             </div>
//                             <div className="flex items-center justify-between">
//                                 <Label htmlFor="showEmail">Show email publicly</Label>
//                                 <Switch
//                                     id="showEmail"
//                                     checked={preferences.showEmail}
//                                     onCheckedChange={(checked) => setPreferences({ ...preferences, showEmail: checked })}
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     <div>
//                         <h4 className="font-medium mb-4 flex items-center gap-2">
//                             <Palette className="w-4 h-4" />
//                             Display Settings
//                         </h4>
//                         <div className="space-y-3">
//                             <div className="flex items-center justify-between">
//                                 <Label htmlFor="autoplayVideos">Autoplay videos</Label>
//                                 <Switch
//                                     id="autoplayVideos"
//                                     checked={preferences.autoplayVideos}
//                                     onCheckedChange={(checked) => setPreferences({ ...preferences, autoplayVideos: checked })}
//                                 />
//                             </div>
//                             <div className="flex items-center justify-between">
//                                 <Label htmlFor="darkMode">Dark mode</Label>
//                                 <Switch
//                                     id="darkMode"
//                                     checked={preferences.darkMode}
//                                     onCheckedChange={(checked) => setPreferences({ ...preferences, darkMode: checked })}
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     <Button onClick={handlePreferencesUpdate} variant="outline" className="w-full md:w-auto">
//                         <Save className="w-4 h-4 mr-2" />
//                         Save Preferences
//                     </Button>
//                 </CardContent>
//             </Card>

//             {/* Account Security */}
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <Shield className="w-5 h-5" />
//                         Account Security
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <Button variant="outline" className="justify-start">
//                             <Mail className="w-4 h-4 mr-2" />
//                             Change Email
//                         </Button>
//                         <Button variant="outline" className="justify-start">
//                             <Shield className="w-4 h-4 mr-2" />
//                             Change Password
//                         </Button>
//                     </div>
                    
//                     <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                         <h4 className="font-medium text-yellow-800 mb-2">Two-Factor Authentication</h4>
//                         <p className="text-sm text-yellow-700 mb-3">
//                             Add an extra layer of security to your account by enabling two-factor authentication.
//                         </p>
//                         <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
//                             Enable 2FA
//                         </Button>
//                     </div>

//                     <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
//                         <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
//                         <p className="text-sm text-red-700 mb-3">
//                             Once you delete your account, there is no going back. Please be certain.
//                         </p>
//                         <Button size="sm" variant="destructive">
//                             <Trash2 className="w-4 h-4 mr-2" />
//                             Delete Account
//                         </Button>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };

// export const UploadSection = () => {
//     const [dragActive, setDragActive] = useState(false);
//     const [uploadedFile, setUploadedFile] = useState<File | null>(null);
//     const [videoDetails, setVideoDetails] = useState({
//         title: '',
//         description: '',
//         thumbnail: null as File | null,
//         visibility: 'public'
//     });
//     const [captions, setCaptions] = useState<Caption[]>([]);
//     const [showCaptionModal, setShowCaptionModal] = useState(false);
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     const handleDrag = (e: React.DragEvent) => {
//         e.preventDefault();
//         e.stopPropagation();
//         if (e.type === "dragenter" || e.type === "dragover") {
//             setDragActive(true);
//         } else if (e.type === "dragleave") {
//             setDragActive(false);
//         }
//     };

//     const handleDrop = (e: React.DragEvent) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setDragActive(false);

//         if (e.dataTransfer?.files?.[0]) {
//             const file = e.dataTransfer.files[0];
//             if (file.type.startsWith('video/')) {
//                 setUploadedFile(file);
//             }
//         }
//     };

//     const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files?.[0]) {
//             setUploadedFile(e.target.files[0]);
//         }
//     };

//     const handlePublish = () => {
//         console.log('Publishing video:', {
//             file: uploadedFile,
//             details: videoDetails,
//             captions: captions
//         });
//         alert('Video published successfully!');
//         setUploadedFile(null);
//         setVideoDetails({ title: '', description: '', thumbnail: null, visibility: 'public' });
//         setCaptions([]);
//     };

//     return (
//         <div className="max-w-4xl mx-auto space-y-6">
//             <Card>
//                 <CardHeader>
//                     <CardTitle className="flex items-center gap-2">
//                         <Upload className="w-5 h-5" />
//                         Upload Video
//                     </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     {!uploadedFile ? (
//                         <fieldset
//                             aria-label="Drag and drop file upload"
//                             className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
//                                 }`}
//                             onDragEnter={handleDrag}
//                             onDragLeave={handleDrag}
//                             onDragOver={handleDrag}
//                             onDrop={handleDrop}
//                         >
//                             <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//                             <h3 className="text-lg font-medium mb-2">Drag and drop video files to upload</h3>
//                             <p className="text-gray-600 mb-4">Your videos will be private until you publish them.</p>
//                             <Button onClick={() => fileInputRef.current?.click()}>
//                                 Select Files
//                             </Button>
//                             <input
//                                 ref={fileInputRef}
//                                 type="file"
//                                 accept="video/*"
//                                 onChange={handleFileSelect}
//                                 className="hidden"
//                             />
//                             <p className="text-xs text-gray-500 mt-4">
//                                 Supported formats: MP4, MOV, AVI, WMV, FLV, WebM
//                             </p>
//                         </fieldset>
//                     ) : (
//                         <div className="space-y-4">
//                             <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
//                                 <CheckCircle className="w-6 h-6 text-green-600" />
//                                 <div className="flex-1">
//                                     <h4 className="font-medium text-green-900">{uploadedFile.name}</h4>
//                                     <p className="text-sm text-green-700">
//                                         {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
//                                     </p>
//                                 </div>
//                                 <Button
//                                     variant="ghost"
//                                     size="sm"
//                                     onClick={() => setUploadedFile(null)}
//                                 >
//                                     <X className="w-4 h-4" />
//                                 </Button>
//                             </div>
//                         </div>
//                     )}
//                 </CardContent>
//             </Card>

//             {uploadedFile && (
//                 <Card>
//                     <CardHeader>
//                         <CardTitle>Video Details</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                         <div>
//                             <label htmlFor='title' className="block text-sm font-medium mb-2">Title</label>
//                             <Input
//                                 id="title"
//                                 value={videoDetails.title}
//                                 onChange={(e) => setVideoDetails({ ...videoDetails, title: e.target.value })}
//                                 placeholder="Enter video title"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor='desc' className="block text-sm font-medium mb-2">Description</label>
//                             <Textarea
//                                 id="desc"
//                                 value={videoDetails.description}
//                                 onChange={(e) => setVideoDetails({ ...videoDetails, description: e.target.value })}
//                                 placeholder="Tell viewers about your video"
//                                 rows={4}
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor='visiblity' className="block text-sm font-medium mb-2">Visibility</label>
//                             <select
//                                 id="visiblity"
//                                 value={videoDetails.visibility}
//                                 onChange={(e) => setVideoDetails({ ...videoDetails, visibility: e.target.value })}
//                                 className="w-full p-2 border border-gray-300 rounded-md"
//                             >
//                                 <option value="public">Public</option>
//                                 <option value="unlisted">Unlisted</option>
//                                 <option value="private">Private</option>
//                             </select>
//                         </div>
//                     </CardContent>
//                 </Card>
//             )}

//             {uploadedFile && (
//                 <Card>
//                     <CardHeader>
//                         <CardTitle className="flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                                 <Subtitles className="w-5 h-5" />
//                                 Captions
//                             </div>
//                             <Dialog open={showCaptionModal} onOpenChange={setShowCaptionModal}>
//                                 <DialogTrigger asChild>
//                                     <Button variant="outline" size="sm">
//                                         <Plus className="w-4 h-4 mr-2" />
//                                         Add Captions
//                                     </Button>
//                                 </DialogTrigger>
//                                 <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
//                                     <CaptionEditor
//                                         captions={captions}
//                                         setCaptions={setCaptions}
//                                         onClose={() => setShowCaptionModal(false)}
//                                     />
//                                 </DialogContent>
//                             </Dialog>
//                         </CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         {captions.length > 0 ? (
//                             <div className="space-y-2">
//                                 <p className="text-sm text-gray-600">{captions.length} caption entries</p>
//                                 <div className="max-h-32 overflow-y-auto space-y-1">
//                                     {captions.slice(0, 3).map((caption) => (
//                                         <div key={caption.id} className="text-xs bg-gray-50 p-2 rounded">
//                                             <span className="font-mono text-gray-500">
//                                                 {caption.startTime} - {caption.endTime}
//                                             </span>
//                                             <p className="mt-1">{caption.text}</p>
//                                         </div>
//                                     ))}
//                                     {captions.length > 3 && (
//                                         <p className="text-xs text-gray-500">...and {captions.length - 3} more</p>
//                                     )}
//                                 </div>
//                             </div>
//                         ) : (
//                             <p className="text-gray-600">No captions added yet. Add captions to make your video accessible.</p>
//                         )}
//                     </CardContent>
//                 </Card>
//             )}

//             {uploadedFile && (
//                 <div className="flex justify-end">
//                     <Button onClick={handlePublish} size="lg" className="px-8">
//                         Publish Video
//                     </Button>
//                 </div>
//             )}
//         </div>
//     );
// };

// const CaptionEditor = ({
//     captions,
//     setCaptions,
//     onClose
// }: {
//     captions: Caption[];
//     setCaptions: (captions: Caption[]) => void;
//     onClose: () => void;
// }) => {
//     const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
//     const [newCaption, setNewCaption] = useState({ startTime: '', endTime: '', text: '' });
//     const fileInputRef = useRef<HTMLInputElement>(null);

//     const handleSRTUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file?.name.endsWith('.srt')) {
//             const reader = new FileReader();
//             reader.onload = (event) => {
//                 const content = event.target?.result as string;
//                 const parsedCaptions = parseSRT(content);
//                 setCaptions(parsedCaptions);
//             };
//             reader.readAsText(file);
//         }
//     };

//     const parseSRT = (content: string): Caption[] => {
//         const blocks = content.trim().split('\n\n');
//         return blocks.map((block, index) => {
//             const lines = block.split('\n');
//             const timeMatch = lines[1]?.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
//             return {
//                 id: `caption-${index}`,
//                 startTime: timeMatch?.[1] || '00:00:00,000',
//                 endTime: timeMatch?.[2] || '00:00:00,000',
//                 text: lines.slice(2).join(' ')
//             };
//         });
//     };

//     const addCaption = () => {
//         if (newCaption.startTime && newCaption.endTime && newCaption.text) {
//             setCaptions([...captions, { ...newCaption, id: `caption-${Date.now()}` }]);
//             setNewCaption({ startTime: '', endTime: '', text: '' });
//         }
//     };

//     const removeCaption = (id: string) => {
//         setCaptions(captions.filter(c => c.id !== id));
//     };

//     return (
//         <div>
//             <DialogHeader>
//                 <DialogTitle>Caption Editor</DialogTitle>
//             </DialogHeader>

//             <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upload' | 'manual')}>
//                 <TabsList className="grid w-full grid-cols-2">
//                     <TabsTrigger value="upload">Upload SRT</TabsTrigger>
//                     <TabsTrigger value="manual">Manual Entry</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="upload" className="space-y-4">
//                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
//                         <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                         <h3 className="font-medium mb-2">Upload SRT Caption File</h3>
//                         <p className="text-sm text-gray-600 mb-4">
//                             Upload a .srt file with your video captions
//                         </p>
//                         <Button onClick={() => fileInputRef.current?.click()}>
//                             Choose SRT File
//                         </Button>
//                         <input
//                             ref={fileInputRef}
//                             type="file"
//                             accept=".srt"
//                             onChange={handleSRTUpload}
//                             className="hidden"
//                         />
//                     </div>
//                 </TabsContent>

//                 <TabsContent value="manual" className="space-y-4">
//                     <div className="grid grid-cols-3 gap-4">
//                         <div>
//                             <label htmlFor='time1' className="block text-sm font-medium mb-2">Start Time</label>
//                             <Input
//                                 id="time1"
//                                 value={newCaption.startTime}
//                                 onChange={(e) => setNewCaption({ ...newCaption, startTime: e.target.value })}
//                                 placeholder="00:00:00,000"
//                             />
//                         </div>
//                         <div>
//                             <label htmlFor='time2' className="block text-sm font-medium mb-2">End Time</label>
//                             <Input
//                                 id="time2"
//                                 value={newCaption.endTime}
//                                 onChange={(e) => setNewCaption({ ...newCaption, endTime: e.target.value })}
//                                 placeholder="00:00:05,000"
//                             />
//                         </div>
//                         <div className="flex items-end">
//                             <Button type='submit' onClick={addCaption} className="w-full">
//                                 <Plus className="w-4 h-4 mr-2" />
//                                 Add
//                             </Button>
//                         </div>
//                     </div>
//                     <div>
//                         <label htmlFor='caption' className="block text-sm font-medium mb-2">Caption Text</label>
//                         <Textarea
//                             id="caption"
//                             value={newCaption.text}
//                             onChange={(e) => setNewCaption({ ...newCaption, text: e.target.value })}
//                             placeholder="Enter caption text"
//                             rows={2}
//                         />
//                     </div>
//                 </TabsContent>
//             </Tabs>

//             {captions.length > 0 && (
//                 <div className="mt-6">
//                     <h4 className="font-medium mb-4">Captions ({captions.length})</h4>
//                     <div className="max-h-64 overflow-y-auto space-y-2">
//                         {captions.map((caption) => (
//                             <div key={caption.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
//                                 <div className="flex-1">
//                                     <div className="text-xs font-mono text-gray-500 mb-1">
//                                         {caption.startTime} → {caption.endTime}
//                                     </div>
//                                     <p className="text-sm">{caption.text}</p>
//                                 </div>
//                                 <Button
//                                     variant="ghost"
//                                     size="sm"
//                                     onClick={() => removeCaption(caption.id)}
//                                 >
//                                     <Trash2 className="w-4 h-4" />
//                                 </Button>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             <div className="flex justify-end gap-2 mt-6">
//                 <Button variant="outline" onClick={onClose}>
//                     Cancel
//                 </Button>
//                 <Button onClick={onClose}>
//                     <Save className="w-4 h-4 mr-2" />
//                     Save Captions
//                 </Button>
//             </div>
//         </div>
//     );
// };

// export const VideosSection = () => {
//     const [videos] = useState<UploadedVideo[]>([
//         {
//             id: '1',
//             title: 'Introduction to Sign Language - Basic Greetings',
//             description: 'Learn the fundamental greetings in American Sign Language',
//             thumbnail: '/sign-language-tutorial.png',
//             duration: '12:34',
//             uploadDate: '2024-01-15',
//             status: 'published',
//             views: '125K',
//             likes: '2.1K',
//             comments: '89',
//             captions: []
//         },
//         {
//             id: '2',
//             title: 'Advanced ASL Grammar Rules',
//             description: 'Deep dive into the grammatical structure of ASL',
//             thumbnail: '/advanced-sign-language.png',
//             duration: '25:18',
//             uploadDate: '2024-01-10',
//             status: 'published',
//             views: '89K',
//             likes: '1.8K',
//             comments: '156',
//             captions: []
//         },
//         {
//             id: '3',
//             title: 'Cooking Tutorial with Sign Language',
//             description: 'Learn to cook while practicing sign language',
//             thumbnail: '/cooking-sign-language.png',
//             duration: '18:45',
//             uploadDate: '2024-01-08',
//             status: 'processing',
//             views: '0',
//             likes: '0',
//             comments: '0',
//             captions: []
//         }
//     ]);

//     const getStatusBadge = (status: string) => {
//         switch (status) {
//             case 'published':
//                 return <Badge className="bg-green-100 text-green-800">Published</Badge>;
//             case 'processing':
//                 return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
//             case 'draft':
//                 return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
//             case 'private':
//                 return <Badge className="bg-blue-100 text-blue-800">Private</Badge>;
//             default:
//                 return <Badge variant="secondary">{status}</Badge>;
//         }
//     };

//     return (
//         <div className="max-w-6xl mx-auto">
//             <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-bold">My Videos</h2>
//                 <div className="flex items-center gap-4">
//                     <select className="px-3 py-2 border border-gray-300 rounded-md">
//                         <option>All videos</option>
//                         <option>Published</option>
//                         <option>Processing</option>
//                         <option>Draft</option>
//                     </select>
//                 </div>
//             </div>

//             <div className="space-y-4">
//                 {videos.map((video) => (
//                     <Card key={video.id}>
//                         <CardContent className="p-6">
//                             <div className="flex gap-6">
//                                 <div className="relative w-48 aspect-video rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
//                                     <Image
//                                         src={video.thumbnail || "/placeholder.svg"}
//                                         alt={video.title}
//                                         fill
//                                         className="object-cover"
//                                     />
//                                     <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
//                                         {video.duration}
//                                     </div>
//                                 </div>

//                                 <div className="flex-1 min-w-0">
//                                     <div className="flex items-start justify-between mb-2">
//                                         <h3 className="font-semibold text-lg line-clamp-2">{video.title}</h3>
//                                         {getStatusBadge(video.status)}
//                                     </div>

//                                     <p className="text-gray-600 text-sm line-clamp-2 mb-4">
//                                         {video.description}
//                                     </p>

//                                     <div className="grid grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
//                                         <div className="flex items-center gap-1">
//                                             <Eye className="w-4 h-4" />
//                                             {video.views} views
//                                         </div>
//                                         <div className="flex items-center gap-1">
//                                             <Heart className="w-4 h-4" />
//                                             {video.likes} likes
//                                         </div>
//                                         <div className="flex items-center gap-1">
//                                             <MessageCircle className="w-4 h-4" />
//                                             {video.comments} comments
//                                         </div>
//                                         <div className="flex items-center gap-1">
//                                             <Calendar className="w-4 h-4" />
//                                             {new Date(video.uploadDate).toLocaleDateString()}
//                                         </div>
//                                     </div>

//                                     <div className="flex items-center gap-2">
//                                         <Link href={`/studios/content/${video.id}`}>
//                                             <Button variant="outline" size="sm">
//                                                 <Edit className="w-4 h-4 mr-2" />
//                                                 Edit
//                                             </Button>
//                                         </Link>
//                                         <Button variant="outline" size="sm">
//                                             <BarChart3 className="w-4 h-4 mr-2" />
//                                             Analytics
//                                         </Button>
//                                         <Button variant="outline" size="sm">
//                                             <Eye className="w-4 h-4 mr-2" />
//                                             View
//                                         </Button>
//                                         <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
//                                             <Trash2 className="w-4 h-4" />
//                                         </Button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export const AnalyticsSection = () => {
//     return (
//         <div className="max-w-6xl mx-auto space-y-6">
//             <h2 className="text-2xl font-bold">Channel Analytics</h2>

//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                 <Card>
//                     <CardContent className="p-6">
//                         <div className="flex items-center gap-4">
//                             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                                 <Eye className="w-6 h-6 text-blue-600" />
//                             </div>
//                             <div>
//                                 <p className="text-2xl font-bold">234K</p>
//                                 <p className="text-sm text-gray-600">Total Views</p>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardContent className="p-6">
//                         <div className="flex items-center gap-4">
//                             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                                 <Users className="w-6 h-6 text-green-600" />
//                             </div>
//                             <div>
//                                 <p className="text-2xl font-bold">12.5K</p>
//                                 <p className="text-sm text-gray-600">Subscribers</p>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardContent className="p-6">
//                         <div className="flex items-center gap-4">
//                             <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
//                                 <Clock className="w-6 h-6 text-purple-600" />
//                             </div>
//                             <div>
//                                 <p className="text-2xl font-bold">1.2K</p>
//                                 <p className="text-sm text-gray-600">Watch Hours</p>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <Card>
//                     <CardContent className="p-6">
//                         <div className="flex items-center gap-4">
//                             <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
//                                 <Video className="w-6 h-6 text-orange-600" />
//                             </div>
//                             <div>
//                                 <p className="text-2xl font-bold">24</p>
//                                 <p className="text-sm text-gray-600">Total Videos</p>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>

//             <Card>
//                 <CardHeader>
//                     <CardTitle>Recent Performance</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="text-center py-12 text-gray-500">
//                         <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
//                         <p>Analytics charts would be displayed here</p>
//                         <p className="text-sm">Connect to analytics service to view detailed metrics</p>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };

export default Studio;