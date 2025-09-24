"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Upload,
  Video,
  BarChart3,
  User,
  Camera,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreatorNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const links = [
    { href: "/upload", text: "Upload", icon: Upload },
    { href: "/content", text: "My Videos", icon: Video },
    { href: "/analytics", text: "Analytics", icon: BarChart3 },
    { href: "/profile", text: "Profile", icon: User },
  ];

  const NavLinks = () => (
    <nav className="flex flex-col space-y-2 mt-8">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsSidebarOpen(false)}
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100",
              isActive && "bg-red-100 text-red-600 font-semibold"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{link.text}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Header for mobile and sidebar toggle */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-4 bg-white border-b md:hidden">
        <Link href="/upload" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">Studio</h1>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-white border-r z-50 transform transition-transform duration-300 ease-in-out",
          "w-64 flex flex-col p-4",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:w-64"
        )}
      >
        <div className="flex items-center justify-between md:justify-start md:gap-2 md:mb-4">
          <Link href="/upload" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">SignFlix Studio</h1>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {session?.user && (
          <div className="mt-8 text-center">
            <Image
              src={session.user.image || "/placeholder.jpg"}
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full mx-auto"
            />
            <h2 className="mt-4 text-lg font-semibold">
              {session.user.name || "Creator"}
            </h2>
            <p className="text-sm text-gray-500">{session.user.email}</p>
          </div>
        )}

        <div className="flex-1">
          <NavLinks />
        </div>

        <div className="mt-auto">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <Home className="h-5 w-5" />
            <span>Back to SignFlix</span>
          </Link>
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
