"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import signUp from "@/lib/signUp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignIn() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { data: session } = useSession();

    useEffect(() => {
        if (session) {
            redirect("/");
        }
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [session]);

    const handleSignIn = async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl: "/",
            });
            if (result?.ok) {
                window.location.replace("/");
            } else {
                if (result?.error === "CredentialsSignin") {
                    setErrorMessage("Invalid email or password. Please try again.");
                } else {
                    setErrorMessage(result?.error || "Invalid credentials. Please try again.");
                }
            }
        } catch (error) {
            setErrorMessage("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            await signUp({ name, email, password });
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl: "/",
            });
            if (result?.ok) {
                window.location.replace("/");
            } else {
                setErrorMessage(result?.error || "Sign up failed. Please try again.");
            }
        } catch (error) {
            setErrorMessage("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-md">
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <Card>
                            <CardHeader>
                                <CardTitle>Login</CardTitle>
                                <CardDescription>Welcome back! Please login to your account.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-2 relative">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" placeholder="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
                                    <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {errorMessage && (
                                    <p className="text-sm text-red-500 text-center">{errorMessage}</p>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSignIn} disabled={isLoading} className="w-full">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                                    {isLoading ? "Signing in..." : "Login"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="signup">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sign Up</CardTitle>
                                <CardDescription>Create an account to get started.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-2 relative">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                    <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {errorMessage && (
                                    <p className="text-sm text-red-500 text-center">{errorMessage}</p>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleSignUp} disabled={isLoading} className="w-full">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                                    {isLoading ? "Signing up..." : "Sign Up"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
                <div className="mt-4 text-center text-sm">
                    <Link href="/" className="underline">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}