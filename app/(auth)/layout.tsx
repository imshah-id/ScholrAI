"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "The AI guidance was spot on. I found universities I hadn't even considered and got accepted with a scholarship.",
    author: "Sarah Chen",
    uni: "Yale University",
    year: "Class of 2025",
  },
  {
    quote:
      "ScholrAI's essay feedback was a game changer. It helped me articulate my story in a way I couldn't have done alone.",
    author: "James Wilson",
    uni: "Stanford",
    year: "Class of 2024",
  },
  {
    quote:
      "I was overwhelmed by the application process. This platform organized everything and kept me on track.",
    author: "Aisha Patel",
    uni: "Imperial College London",
    year: "Class of 2026",
  },
  {
    quote:
      "The readiness score motivated me to improve my profile. Highly improved my chances!",
    author: "David Kim",
    uni: "University of Toronto",
    year: "Class of 2025",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Randomize initial start
    setIndex(Math.floor(Math.random() * TESTIMONIALS.length));

    // Auto-rotate every 5 seconds
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Visual Side */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-navy-900 border-r border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-teal-500/10 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-2">
          <div className="bg-gradient-to-tr from-teal-400 to-teal-600 p-2 rounded-lg">
            <div className="w-6 h-6 bg-white/20 rounded-sm" />
          </div>
          <span className="text-xl font-bold text-white">ScholrAI</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <Quote className="w-10 h-10 text-primary mb-6 opacity-50" />
          <div className="h-40">
            {" "}
            {/* Fixed height to prevent layout shift */}
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <blockquote className="text-2xl font-medium text-white leading-relaxed mb-6">
                  &quot;{TESTIMONIALS[index].quote}&quot;
                </blockquote>
                <div>
                  <p className="text-white font-bold">
                    {TESTIMONIALS[index].author}
                  </p>
                  <p className="text-teal-400 text-sm">
                    {TESTIMONIALS[index].uni}, {TESTIMONIALS[index].year}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicators */}
          <div className="flex gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === index ? "w-8 bg-primary" : "w-2 bg-white/20"}`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-500">
          © 2026 ScholrAI Inc.
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-6 bg-navy-950 relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="w-full max-w-md space-y-8 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
