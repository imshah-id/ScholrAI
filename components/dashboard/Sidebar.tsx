"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Compass,
  Bookmark,
  ListTodo,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) setUser(data);
      })
      .catch((err) => console.error("Sidebar auth check failed", err));
  }, []);

  const links = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
    { name: "Discovery", href: "/dashboard/universities", icon: Compass },
    { name: "Shortlist", href: "/dashboard/shortlist", icon: Bookmark },
    { name: "Guidance", href: "/dashboard/guidance", icon: ListTodo },
    {
      name: "AI Counsellor",
      href: "/dashboard/counsellor",
      icon: MessageSquare,
    },
  ];

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-navy-900 border-r border-white/10 flex flex-col z-40">
      <div className="h-20 flex items-center px-6 border-b border-white/10">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal-400">
          ScholrAI
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1",
                  isActive
                    ? "bg-primary text-navy-900 font-bold shadow-lg shadow-primary/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5",
                )}
              >
                <link.icon
                  className={cn(
                    "w-5 h-5",
                    isActive
                      ? "text-navy-900"
                      : "text-gray-500 group-hover:text-white",
                  )}
                />
                {link.name}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>

        <div className="mt-4 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center font-bold text-white">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-white truncate">
              {user?.fullName?.split(" ")[0] || "User"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
