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
            router.push('/signin');
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
                        <TabsTrigger className='cursor-pointer' value="upload">Upload</TabsTrigger>
                        <TabsTrigger className='cursor-pointer' value="videos">My Videos</TabsTrigger>
                        <TabsTrigger className='cursor-pointer' value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger className='cursor-pointer' value="profile">Profile</TabsTrigger>
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

export default Studio;