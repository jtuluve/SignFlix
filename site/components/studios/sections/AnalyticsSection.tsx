
'use client';

import getUserAnalytics from "@/lib/analytics";
import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface Metrics {
    totalViews: number;
    totalLikes: number;
    totalVideos: number;
    subscribers: number;
    viewsPerVideo: { title: string; views: number }[];
    likesPerVideo: { title: string; likes: number }[];
    viewsOverTime: { date: string; views: number }[];
    subscribersOverTime: { date: string; subscribers: number }[];
}

// Function to generate random colors
const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
};

export default function AnalyticsSection() {
    const [metrics, setMetrics] = useState<Metrics>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await getUserAnalytics();
                setMetrics(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        })()
    }, [])

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold">Channel Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        )
    }

    const lineChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Chart.js Line Chart',
            },
        },
    };

    const barChartOptions = (videoTitles: string[]) => ({
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
                labels: {
                    generateLabels: () => {
                        return videoTitles.map((title, index) => ({
                            text: `${index + 1}: ${title}`,
                            fillStyle: 'rgba(0, 0, 0, 0)', // Hide the color box
                            hidden: false,
                            lineCap: 'butt' as const,
                            lineDash: [],
                            lineDashOffset: 0,
                            lineJoin: 'miter' as const,
                            lineWidth: 0,
                            strokeStyle: 'rgba(0, 0, 0, 0)',
                            pointStyle: 'rect' as const,
                            rotation: 0,
                            textAlign: 'left' as const,
                            fontColor: '#000',
                        }));
                    }
                }
            },
            title: {
                display: true,
                text: 'Chart.js Bar Chart',
            },
        },
    });

    const viewsPerVideoData = {
        labels: metrics?.viewsPerVideo.map((_, index) => (index + 1).toString()),
        datasets: [
            {
                label: 'Views',
                data: metrics?.viewsPerVideo.map(item => item.views) ?? [],
                backgroundColor: metrics?.viewsPerVideo.map(() => generateRandomColor()) ?? [],
            }
        ]
    };

    const likesPerVideoData = {
        labels: metrics?.likesPerVideo.map((_, index) => (index + 1).toString()),
        datasets: [
            {
                label: 'Likes',
                data: metrics?.likesPerVideo.map(item => item.likes) ?? [],
                backgroundColor: metrics?.likesPerVideo.map(() => generateRandomColor()) ?? [],
            }
        ]
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Channel Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalViews.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Subscribers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.subscribers.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Likes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalLikes.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Videos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics?.totalVideos.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Views Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Line 
                            options={lineChartOptions}
                            data={{
                                labels: metrics?.viewsOverTime.map(item => item.date),
                                datasets: [
                                    {
                                        label: 'Views',
                                        data: metrics?.viewsOverTime.map(item => item.views) ?? [],
                                        borderColor: 'rgb(255, 99, 132)',
                                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                    }
                                ]
                            }}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Subscribers Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Line
                            options={lineChartOptions}
                            data={{
                                labels: metrics?.subscribersOverTime.map(item => item.date),
                                datasets: [
                                    {
                                        label: 'Subscribers',
                                        data: metrics?.subscribersOverTime.map(item => item.subscribers) ?? [],
                                        borderColor: 'rgb(53, 162, 235)',
                                        backgroundColor: 'rgba(53, 162, 235, 0.5)',
                                    }
                                ]
                            }}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Views per Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Bar
                            options={barChartOptions(metrics?.viewsPerVideo.map(item => item.title) ?? [])}
                            data={viewsPerVideoData}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Likes per Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Bar
                            options={barChartOptions(metrics?.likesPerVideo.map(item => item.title) ?? [])}
                            data={likesPerVideoData}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
