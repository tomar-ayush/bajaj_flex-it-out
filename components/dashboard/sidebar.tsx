"use client";

import { cn } from "@/lib/utils";
import logo from "@/public/logo.png";
import {
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Rocket,
  Settings,
  Trophy,
  Upload,
  User,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { useSession } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Daily Challenges", href: "/dashboard/challenges", icon: Rocket },
  { name: "Rewards Store", href: "/dashboard/rewards", icon: Gift },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { name: "Add Pose", href: "/dashboard/addpose", icon: Upload },
  { name: "Settings", href: "/dashboard/profile", icon: Settings },

];

export function Sidebar() {

  const { status, data: session } = useSession();

  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "GET" });
      window.location.href = "/"
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const user = {
    name: "John Doe",
    avatar: session?.user?.image ||

      "https://avatars.githubusercontent.com/u/117257768?s=400&u=58fca1a27a28a0acd263ce4a026b32979d05cd56&v=4", // Replace with actual avatar URL or leave empty to show fallback icon.
  };

  const renderAvatar = (size = "h-10 w-10") => {
    return user.avatar ? (
      <img
        src={user.avatar}
        alt="User Avatar"
        className={`${size} rounded-full cursor-pointer`}
        onClick={() => setProfileModalOpen(true)}
      />
    ) : (
      <User
        className={`${size} text-muted-foreground cursor-pointer`}
        onClick={() => setProfileModalOpen(true)}
      />
    );
  };

  return (
    <>
      {/* Mobile Top Navigation */}
      <div className="flex sm:hidden bg-card border-b p-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center font-semibold text-xl">

            <Image src={logo} alt="logo" width={25} height={25} className="mr-2" />
            <Link href="/">
              FlexIt<span className="text-blue-500">Out</span>.
            </Link>
          </div>
        </div>
        <button onClick={toggleMobileMenu} className="text-muted-foreground">
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
          <div className="flex items-center justify-between border-t pt-2">
            <ThemeToggle />
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" onClick={handleLogout} >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full flex-col bg-card">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex items-center font-semibold text-lg">

            <Image src={logo} alt="logo" width={25} height={25} className="mr-2" />
            <Link href="/">
              FlexIt<span className="text-blue-500">Out</span>.
            </Link>
          </div>
        </div>
        <div className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center justify-between border-t p-4">
          <ThemeToggle />
          {/* Replace Logout with Profile Avatar */}
          <div>{renderAvatar("h-8 w-8")}</div>
        </div>
      </div>

      {/* Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-80 rounded-lg bg-background p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">Account Options</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard/profile"
                  className="block rounded-md px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setProfileModalOpen(false)}
                >
                  Manage Profile
                </Link>
              </li>
              <li>
                <button
                  className="w-full rounded-md px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    setProfileModalOpen(false);
                    handleLogout()
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
            <button
              className="mt-4 w-full rounded-md bg-muted p-2 hover:bg-muted/80"
              onClick={() => setProfileModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
