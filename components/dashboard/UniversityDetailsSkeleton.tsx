"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Star,
  Award,
  Users,
  DollarSign,
  BookOpen,
  TrendingUp,
} from "lucide-react";

export default function UniversityDetailsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-pulse">
      {/* Back Button Skeleton */}
      <div className="flex items-center gap-2 text-gray-500">
        <div className="p-2 rounded-full bg-white/5">
          <ChevronLeft className="w-4 h-4" />
        </div>
        <div className="h-4 w-32 bg-white/5 rounded"></div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="glass rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
        <div className="h-64 bg-navy-800/50 relative">
          <div className="absolute top-6 right-6">
            <div className="bg-black/30 backdrop-blur-md border border-white/5 px-4 py-1.5 rounded-full flex items-center gap-2">
              <Award className="w-4 h-4 text-gray-700" />
              <div className="h-4 w-32 bg-white/5 rounded"></div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col md:flex-row items-end gap-6 z-10">
            <div className="w-32 h-32 rounded-2xl bg-navy-800 border-4 border-navy-900 flex items-center justify-center -mb-8 relative z-20">
              <div className="h-16 w-16 bg-white/5 rounded-full"></div>
            </div>

            <div className="flex-1 mb-2 space-y-3">
              <div className="h-10 w-3/4 bg-white/10 rounded-lg"></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-700" />
                  <div className="h-4 w-24 bg-white/5 rounded"></div>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-600" />
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-700" />
                  <div className="h-4 w-40 bg-white/5 rounded"></div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto mb-2">
              <div className="h-12 w-48 bg-white/10 rounded-xl"></div>
            </div>
          </div>
        </div>
        <div className="h-12 bg-navy-900/20" />
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* AI Match Card Skeleton */}
          <div className="glass p-8 rounded-3xl border border-white/5 bg-navy-900/30 relative overflow-hidden">
            <div className="h-6 w-48 bg-white/5 rounded mb-8"></div>
            <div className="flex items-center gap-8">
              <div className="w-28 h-28 rounded-full border-8 border-white/5 shrink-0"></div>
              <div className="flex-1 space-y-4">
                <div className="h-6 w-24 bg-white/10 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-white/5 rounded"></div>
                  <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                  <div className="h-4 w-4/6 bg-white/5 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Strengths Skeleton */}
          <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 bg-navy-900/30">
            <div className="h-6 w-48 bg-white/5 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-white/5 rounded"></div>
              <div className="h-4 w-full bg-white/5 rounded"></div>
              <div className="h-4 w-2/3 bg-white/5 rounded"></div>
            </div>
            <div className="flex flex-wrap gap-2 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-24 bg-white/5 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Admissions Card Skeleton */}
          <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 bg-navy-900/30">
            <div className="h-6 w-40 bg-white/5 rounded"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-20 bg-white/5 rounded-2xl border border-white/5"></div>
              <div className="h-20 bg-white/5 rounded-2xl border border-white/5"></div>
            </div>
            <div className="space-y-4 pt-2">
              <div className="h-4 w-full bg-white/5 rounded"></div>
              <div className="h-4 w-full bg-white/5 rounded"></div>
              <div className="h-4 w-full bg-white/5 rounded"></div>
            </div>
          </div>

          {/* Costs Skeleton */}
          <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 bg-navy-900/30">
            <div className="h-6 w-40 bg-white/5 rounded"></div>
            <div className="h-10 w-32 bg-white/10 rounded mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 w-full bg-white/5 rounded"></div>
              <div className="h-2 w-full bg-white/5 rounded-full"></div>
              <div className="h-20 bg-white/5 rounded-xl border border-white/5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
