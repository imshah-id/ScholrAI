"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export function FloatingChatButton() {
  return (
    <Link href="/dashboard/counsellor">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        className="md:hidden fixed bottom-24 right-4 z-40 bg-gradient-to-tr from-teal-500 to-teal-400 text-white rounded-full p-4 shadow-2xl shadow-teal-500/50 hover:shadow-teal-500/70 transition-shadow"
      >
        <MessageSquare className="w-6 h-6" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      </motion.div>
    </Link>
  );
}
