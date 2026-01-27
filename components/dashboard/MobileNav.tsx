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
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Discovery", href: "/dashboard/universities", icon: Compass },
    { name: "Shortlist", href: "/dashboard/shortlist", icon: Bookmark },
    { name: "Guidance", href: "/dashboard/guidance", icon: ListTodo },
    { name: "AI Chat", href: "/dashboard/counsellor", icon: MessageSquare },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-navy-900 border-t border-white/10 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-gray-400 hover:text-white active:scale-95",
              )}
            >
              <link.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
