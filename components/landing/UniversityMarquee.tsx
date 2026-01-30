"use client";

import { motion } from "framer-motion";
import { TrendingUp, MapPin, Star } from "lucide-react";

const UNIVERSITIES = [
  {
    name: "Stanford University",
    location: "USA",
    rank: "#2",
    acceptance: "3.9%",
  },
  {
    name: "University of Oxford",
    location: "UK",
    rank: "#1",
    acceptance: "17%",
  },
  { name: "MIT", location: "USA", rank: "#3", acceptance: "4.1%" },
  {
    name: "University of Cambridge",
    location: "UK",
    rank: "#5",
    acceptance: "21%",
  },
  {
    name: "Harvard University",
    location: "USA",
    rank: "#4",
    acceptance: "3.4%",
  },
  {
    name: "Imperial College London",
    location: "UK",
    rank: "#6",
    acceptance: "14%",
  },
  {
    name: "ETH Zurich",
    location: "Switzerland",
    rank: "#11",
    acceptance: "27%",
  },
  {
    name: "National University of Singapore",
    location: "Singapore",
    rank: "#8",
    acceptance: "5%",
  },
  { name: "UCL", location: "UK", rank: "#9", acceptance: "30%" },
  {
    name: "University of Toronto",
    location: "Canada",
    rank: "#21",
    acceptance: "43%",
  },
];

export const UniversityMarquee = () => {
  return (
    <section className="py-12 bg-navy-900 border-y border-white/5 relative overflow-hidden">
      {/* Gradient Masks for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-navy-900 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-navy-900 to-transparent z-10" />

      <div className="mb-8 text-center relative z-10">
        <p className="text-sm font-bold text-primary tracking-widest uppercase mb-2">
          Global Reach
        </p>
        <h3 className="text-xl text-white/80 font-medium">
          Access data from 4,000+ top institutions
        </h3>
      </div>

      <div className="flex overflow-hidden relative">
        <motion.div
          className="flex gap-6 px-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 30, // Adjust speed (seconds to scroll half width)
            ease: "linear",
            repeat: Infinity,
          }}
          style={{ width: "fit-content" }}
        >
          {/* Duplicate list to create seamless loop */}
          {[...UNIVERSITIES, ...UNIVERSITIES].map((uni, i) => (
            <div
              key={i}
              className="w-[280px] shrink-0 glass p-5 rounded-2xl border border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all group cursor-default"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary font-bold text-lg border border-white/10 group-hover:scale-110 transition-transform">
                  {uni.name[0]}
                </div>
                <div className="px-2 py-1 rounded-full bg-navy-950/50 border border-white/10 text-[10px] font-mono text-gray-400">
                  Global Rank{" "}
                  <span className="text-white font-bold">{uni.rank}</span>
                </div>
              </div>

              <h4 className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">
                {uni.name}
              </h4>

              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-500" />
                  {uni.location}
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-gray-300">
                    Acc:{" "}
                    <span className="text-white font-bold">
                      {uni.acceptance}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
