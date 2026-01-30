import { m, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  ArrowRight,
  BookOpen,
  Trophy,
  BadgeDollarSign,
} from "lucide-react";

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  unis: any[];
}

export default function ComparisonModal({
  isOpen,
  onClose,
  unis,
}: ComparisonModalProps) {
  if (unis.length !== 2) return null;
  const [u1, u2] = unis;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-20 bg-navy-900 border border-white/10 rounded-3xl z-50 flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-navy-800/50">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="p-2 bg-primary/20 rounded-lg text-primary">
                  <ArrowRight className="w-5 h-5" />
                </span>
                University Comparison
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-2 divide-x divide-white/10">
              {/* Header Info */}
              {[u1, u2].map((uni, i) => (
                <div key={i} className="p-6 space-y-6">
                  {/* Name & Location */}
                  <div className="text-center">
                    <div className="inline-block p-3 rounded-full bg-white/5 mb-3 border border-white/10 shadow-lg">
                      <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{uni.name}</h3>
                    <p className="text-gray-400">{uni.country}</p>
                  </div>

                  {/* Match Score */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-center">
                    <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">
                      Match Score
                    </div>
                    <div
                      className={`text-3xl font-bold ${
                        (uni.matchScore || 0) >= 80
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {uni.matchScore || 0}%
                    </div>
                  </div>

                  {/* Stats comparison */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <Trophy className="w-4 h-4" /> Global Rank
                      </div>
                      <div className="font-bold text-lg">
                        #{uni.rank || "N/A"}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <BadgeDollarSign className="w-4 h-4" /> Est. Fees
                      </div>
                      <div className="font-bold text-lg text-green-400">
                        {uni.fees || "TBD"}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <Check className="w-4 h-4" /> Acceptance
                      </div>
                      <div className="font-bold text-lg">
                        {uni.acceptanceRate || "TBD"}
                      </div>
                    </div>
                  </div>

                  {/* Why it fits (AI) */}
                  <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full" />
                    <h4 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" /> Why it fits
                    </h4>
                    <p className="text-sm text-blue-100 leading-relaxed opacity-90">
                      {uni.reasons?.[0] || "No AI analysis available yet."}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-white/10 bg-navy-800/50 text-center">
              <p className="text-sm text-gray-500">
                AI-generated comparison based on your profile compatibility.
              </p>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
