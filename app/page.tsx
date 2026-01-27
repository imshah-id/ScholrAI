"use client";

import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";

export default function Home() {
  return (
    <main className="min-h-screen bg-navy-900 text-white overflow-hidden selection:bg-teal-500/30">
      <NavBar />
      <Hero />
      <Features />

      {/* Short Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-gray-500 text-sm">
        <p>© 2026 ScholrAI. All rights reserved.</p>
      </footer>
    </main>
  );
}
