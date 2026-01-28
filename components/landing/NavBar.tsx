"use client";

import Link from "next/link";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function NavBar() {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 border-b border-white/5 bg-navy-900/60 backdrop-blur-xl shadow-lg transition-all duration-300"
    >
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-tr from-teal-400 to-teal-600 p-2 rounded-lg group-hover:scale-105 transition-transform shadow-lg shadow-teal-500/20">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 tracking-tight">
            ScholrAI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it Works"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block"
          >
            Log In
          </Link>
          <Link href="/signup">
            <button className="bg-primary hover:bg-gold-400 text-navy-900 font-bold py-2 px-6 rounded-full transition-all hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
