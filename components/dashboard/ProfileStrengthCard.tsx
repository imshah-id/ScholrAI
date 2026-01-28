"use client";

import { motion } from "framer-motion";
import { BookOpen, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

interface ProfileStrengthCardProps {
  strength: number;
  missingFields?: string[];
  className?: string;
}

export default function ProfileStrengthCard({
  strength,
  missingFields = [],
  className = "",
}: ProfileStrengthCardProps) {
  return (
    <div
      className={`glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all ${className}`}
    >
      {/* Background Decor */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 blur-xl" />

      {/* Header */}
      <div className="flex items-start justify-between relative z-10 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400 shadow-lg shadow-purple-500/10">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-gray-400 font-medium">
              Profile Strength
            </div>
            <div className="text-3xl font-bold text-white flex items-baseline gap-1">
              {strength}%
              <span className="text-xs font-normal text-gray-500">
                complete
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 mb-6">
        <div className="flex justify-between text-xs mb-1.5 font-medium">
          <span className="text-purple-400">Current Level</span>
          <span className="text-gray-500">Target: 100%</span>
        </div>
        <div className="w-full bg-navy-900/50 h-2.5 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500 h-full shadow-[0_0_10px_rgba(168,85,247,0.4)]"
            initial={{ width: 0 }}
            animate={{ width: `${strength}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Next Steps (Actionable Items) */}
      {missingFields.length > 0 ? (
        <div className="relative z-10 bg-navy-900/40 rounded-xl p-3 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
            Action Items
          </div>
          <div className="space-y-2">
            {missingFields.slice(0, 3).map((field, i) => (
              <div
                key={i}
                className="flex items-center justify-between group/item"
              >
                <span className="text-xs text-gray-400 group-hover/item:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-orange-400/50" />
                  {field}
                </span>
                <ArrowRight className="w-3 h-3 text-white/20 group-hover/item:text-orange-400 transition-colors" />
              </div>
            ))}
            {missingFields.length > 3 && (
              <div className="text-[10px] text-center text-gray-500 pt-1">
                + {missingFields.length - 3} more
              </div>
            )}
          </div>
        </div>
      ) : strength < 100 ? (
        <div className="relative z-10 bg-navy-900/40 rounded-xl p-3 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
            Optimization
          </div>
          <p className="text-xs text-gray-400">
            Your profile is complete, but you can improve your{" "}
            <strong>GPA</strong> or <strong>Test Scores</strong> to reach 100%.
          </p>
        </div>
      ) : (
        <div className="relative z-10 flex items-center gap-2 text-sm text-green-400 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-semibold">All set! Profile is top tier.</span>
        </div>
      )}
    </div>
  );
}
