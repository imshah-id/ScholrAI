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
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [shortlistCount, setShortlistCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    // Fetch User
    fetch("/api/user/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser(data);
      })
      .catch((err) => console.error("Sidebar auth check failed", err));

    // Fetch Shortlist Count
    fetch("/api/shortlist")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setShortlistCount(data.length))
      .catch((err) => console.error("Shortlist fetch failed", err));
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
    setIsSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });

      // Clear persistence and cache
      localStorage.removeItem("scholrai_chat_history");
      sessionStorage.removeItem("scholrai_profile_data");
      sessionStorage.removeItem("scholrai_profile_docs");

      // Redirect with message param so login page can show success alert
      window.location.href = "/login?message=logged_out";
    } catch (e) {
      console.error(e);
      setIsSigningOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-navy-900 border-r border-white/10 flex-col z-40">
      <div className="h-20 flex items-center px-6 border-b border-white/10 gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <GraduationCap className="w-6 h-6 text-navy-900" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          ScholrAI
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <motion.div
                whileTap={{ scale: 0.95 }}
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
                <span className="flex-1">{link.name}</span>
                {link.name === "Shortlist" && shortlistCount > 0 && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      isActive
                        ? "bg-navy-900/20 text-navy-900"
                        : "bg-primary text-navy-900",
                    )}
                  >
                    {shortlistCount}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        {showLogoutConfirm ? (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
            <p className="text-xs text-center text-gray-400 mb-1">
              Are you sure?
            </p>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-navy-800 text-gray-300 hover:bg-navy-700 hover:text-white text-xs font-bold transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                {isSigningOut ? "..." : "Logout"}
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all group hover:shadow-lg hover:shadow-red-500/10"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Sign Out
          </motion.button>
        )}

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
