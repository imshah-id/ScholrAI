"use client";

import Link from "next/link";
import { Menu, User, GraduationCap } from "lucide-react";
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <GraduationCap className="w-5 h-5 text-navy-900" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            ScholrAI
          </span>
        </div>

        <Link href="/dashboard/profile">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 active:scale-95 transition-all">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center font-bold text-white text-sm">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <span className="text-sm font-medium text-gray-300">
              {user?.fullName?.split(" ")[0] || "Profile"}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
