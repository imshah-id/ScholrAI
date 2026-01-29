"use client";

import Link from "next/link";
import { Menu, User, GraduationCap, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export function MobileHeader() {
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
      .catch((err) => console.error("Header auth check failed", err));
  }, []);

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 bg-navy-900 border-b border-white/10 z-40 safe-area-inset-top">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <GraduationCap className="w-5 h-5 text-navy-900" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            ScholrAI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              if (confirm("Are you sure you want to log out?")) {
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                  localStorage.removeItem("scholrai_chat_history");
                  sessionStorage.removeItem("scholrai_profile_data");
                  sessionStorage.removeItem("scholrai_profile_docs");
                  window.location.href = "/login?message=logged_out";
                } catch (e) {
                  console.error(e);
                }
              }
            }}
            className="p-2 rounded-lg bg-navy-800 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>

          <Link href="/dashboard/profile">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 active:scale-95 transition-all">
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-teal-400 to-blue-500 flex items-center justify-center font-bold text-white text-sm">
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <span className="text-sm font-medium text-gray-300">
                {user?.fullName?.split(" ")[0] || "Profile"}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
