import { m } from "framer-motion";
import {
  MapPin,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  Check,
  X,
  Star,
} from "lucide-react";
import React, { memo } from "react";

interface UniversityCardProps {
  uni: any;
  index: number;
  isShortlisted: boolean;
  isLoadingShortlist: boolean;
  onViewDetails: (uni: any) => void;
  onShortlist: (uni: any) => void;
}

export const UniversityCard = memo(function UniversityCard({
  uni,
  index,
  isShortlisted,
  isLoadingShortlist,
  onViewDetails,
  onShortlist,
}: UniversityCardProps) {
  return (
    <m.div
      layoutId={uni.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass rounded-2xl border overflow-hidden hover:border-primary/50 transition-all group relative hover:shadow-2xl hover:shadow-primary/5 hover:scale-[1.02] flex flex-col h-full ${
        uni.isExternal ? "border-blue-500/20 bg-blue-900/10" : "border-white/5"
      }`}
    >
      {/* Match Score Badge (Only for Local) */}
      {!uni.isExternal && uni.matchScore !== undefined && (
        <div className="absolute top-4 right-4 bg-navy-900/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5 z-10">
          <div
            className={`w-2 h-2 rounded-full animate-pulse ${
              (uni.matchScore || 0) >= 80
                ? "bg-green-500"
                : (uni.matchScore || 0) >= 50
                  ? "bg-yellow-500"
                  : "bg-gray-500"
            }`}
          />
          <span
            className={`text-xs font-bold ${
              (uni.matchScore || 0) >= 80
                ? "text-green-400"
                : (uni.matchScore || 0) >= 50
                  ? "text-yellow-400"
                  : "text-gray-400"
            }`}
          >
            {uni.matchScore || 0}% Match
          </span>
        </div>
      )}

      {/* External Data Badge - Sleek Version */}
      {uni.isExternal && (
        <div className="absolute top-4 right-4 bg-blue-500/10 backdrop-blur-md border border-blue-400/30 px-3 py-1 rounded-full flex items-center gap-1.5 z-10 shadow-lg shadow-blue-500/10">
          <Sparkles className="w-3 h-3 text-blue-300" />
          <span className="text-xs font-bold text-blue-300">AI Discovery</span>
        </div>
      )}

      <div
        className={`h-32 relative p-6 flex items-end shrink-0 ${
          uni.isExternal
            ? "bg-linear-to-br from-slate-800 to-slate-900"
            : "bg-linear-to-br from-navy-800 to-navy-900"
        }`}
      >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity" />

        {/* Category Badge (Top Left) */}
        {!uni.isExternal && (
          <div
            className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
              (uni.matchScore || 0) >= 80
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : (uni.matchScore || 0) >= 50
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {(uni.matchScore || 0) >= 80
              ? "🎯 Safe"
              : (uni.matchScore || 0) >= 50
                ? "✨ Target"
                : "🚀 Dream"}
          </div>
        )}

        <h3 className="text-xl font-bold leading-tight relative z-10 text-white line-clamp-2">
          {uni.name}
        </h3>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4 relative">
        {/* Location & AI Insight */}
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <MapPin className="w-4 h-4 text-primary" />{" "}
            {uni.country || "Unknown Location"}
          </div>
          {!uni.isExternal && uni.reasons && uni.reasons.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-purple-200 bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
              <Sparkles className="w-3.5 h-3.5 mt-0.5 text-purple-400 shrink-0" />
              <span className="italic leading-snug">"{uni.reasons[0]}"</span>
            </div>
          )}
        </div>

        {/* Enhanced Stats Grid */}
        {!uni.isExternal ? (
          <div className="grid grid-cols-2 gap-3 py-3 border-t border-white/5 border-b">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                Global Rank
              </div>
              <div className="font-bold text-white text-sm">
                #{uni.rank || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                Est. Fees
              </div>
              <div className="font-bold text-green-400 text-sm">{uni.fees}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                Acceptance
              </div>
              <div className="font-bold text-white text-sm">
                {uni.acceptanceRate || "TBD"}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                Odds
              </div>
              <div
                className={`font-bold text-sm flex items-center gap-1 ${
                  uni.matchChance === "High"
                    ? "text-green-400"
                    : uni.matchChance === "Medium"
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                {uni.matchChance || "TBD"}
              </div>
            </div>
          </div>
        ) : (
          // External Data - Locked State
          <div className="relative py-4 border-t border-white/5 border-b border-white/5 space-y-2">
            {/* Blurred Fake Data for Effect */}
            <div className="grid grid-cols-2 gap-3 blur-sm select-none opacity-40">
              <div>
                <div className="h-2 w-16 bg-gray-600 rounded mb-1"></div>
                <div className="h-4 w-10 bg-gray-500 rounded"></div>
              </div>
              <div>
                <div className="h-2 w-16 bg-gray-600 rounded mb-1"></div>
                <div className="h-4 w-12 bg-green-900/50 rounded"></div>
              </div>
            </div>

            {/* Overlay Call to Action */}
            <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
              <div className="text-xs font-bold text-blue-300 bg-navy-900/90 px-3 py-1.5 rounded-full border border-blue-500/30 flex items-center gap-2 shadow-xl">
                <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                Analyze to Reveal Data
              </div>
            </div>
          </div>
        )}

        {/* Footer / Buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          {/* Website Link (Subtle) for External */}
          {uni.isExternal && uni.web_pages?.[0] && (
            <a
              href={uni.web_pages[0]}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-gray-500 hover:text-blue-400 flex items-center gap-1 mx-auto transition-colors"
            >
              Visit {new URL(uni.web_pages[0]).hostname}{" "}
              <ArrowUpRight className="w-3 h-3" />
            </a>
          )}
          {!uni.isExternal && (
            <div className="flex flex-wrap gap-1.5">
              {(() => {
                try {
                  const tags = JSON.parse(uni.tags || "[]");
                  return tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 bg-navy-800 text-gray-400 rounded border border-white/5"
                    >
                      {tag}
                    </span>
                  ));
                } catch (e) {
                  return null;
                }
              })()}
            </div>
          )}

          <div className="flex gap-2">
            <m.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewDetails(uni)}
              className={`flex-1 ${
                uni.isExternal
                  ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-blue-500/30"
                  : "bg-white/5 hover:bg-white/10 text-white border-white/10"
              } py-2.5 rounded-xl font-medium text-xs transition-all border cursor-pointer flex items-center justify-center gap-2`}
            >
              {uni.isExternal ? (
                <>
                  <Sparkles className="w-3 h-3" /> AI Analyze
                </>
              ) : (
                "View Details"
              )}
            </m.button>
            {!uni.isExternal && (
              <m.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onShortlist(uni)}
                disabled={isLoadingShortlist}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer group/btn ${
                  isShortlisted
                    ? "bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400 border border-green-500/30 hover:border-red-500/30"
                    : "bg-primary text-navy-900 hover:bg-gold-400 hover:shadow-lg hover:shadow-primary/20"
                }`}
              >
                {isLoadingShortlist ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {isShortlisted ? "Removing" : "Adding"}
                  </>
                ) : isShortlisted ? (
                  <>
                    <span className="flex items-center gap-1 group-hover/btn:hidden">
                      <Check className="w-3 h-3" /> Saved
                    </span>
                    <span className="hidden group-hover/btn:flex items-center gap-1">
                      <X className="w-3 h-3" /> Remove
                    </span>
                  </>
                ) : (
                  <>
                    <Star className="w-3 h-3" /> Shortlist
                  </>
                )}
              </m.button>
            )}
          </div>
        </div>
      </div>
    </m.div>
  );
});
