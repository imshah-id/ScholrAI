import { m } from "framer-motion";
import { Dispatch, SetStateAction } from "react";

interface FilterState {
  minMatch: number;
  maxFees: number;
  maxRank: number;
  country: string;
}

interface DiscoveryFiltersProps {
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  countries: string[];
}

export default function DiscoveryFilters({
  showFilters,
  setShowFilters,
  filters,
  setFilters,
  countries,
}: DiscoveryFiltersProps) {
  if (!showFilters) return null;

  return (
    <m.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="absolute right-0 top-12 z-50 w-72 bg-navy-900 border border-white/10 rounded-2xl shadow-xl p-4 space-y-4 backdrop-blur-xl"
    >
      <div>
        <label className="text-xs font-bold text-gray-400 mb-2 block">
          Minimum Match Score
        </label>
        <input
          type="range"
          min="0"
          max="90"
          step="10"
          value={filters.minMatch}
          onChange={(e) =>
            setFilters({
              ...filters,
              minMatch: parseInt(e.target.value),
            })
          }
          className="w-full h-2 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span className="text-primary font-bold">{filters.minMatch}%+</span>
        </div>
      </div>

      {/* Max Fees Slider */}
      <div>
        <label className="text-xs font-bold text-gray-400 mb-2 block">
          Max Annual Fees
        </label>
        <input
          type="range"
          min="0"
          max="100000"
          step="5000"
          value={filters.maxFees}
          onChange={(e) =>
            setFilters({
              ...filters,
              maxFees: parseInt(e.target.value),
            })
          }
          className="w-full h-2 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>$0</span>
          <span className="text-primary font-bold">
            ${(filters.maxFees / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      {/* Max Rank Slider */}
      <div>
        <label className="text-xs font-bold text-gray-400 mb-2 block">
          Max Global Rank
        </label>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={filters.maxRank}
          onChange={(e) =>
            setFilters({
              ...filters,
              maxRank: parseInt(e.target.value),
            })
          }
          className="w-full h-2 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Top 10</span>
          <span className="text-primary font-bold">Top {filters.maxRank}</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 mb-2 block">
          Country
        </label>
        <select
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          className="w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-2 border-t border-white/10 flex justify-between">
        <button
          onClick={() =>
            setFilters({
              minMatch: 0,
              maxFees: 100000,
              maxRank: 500,
              country: "All",
            })
          }
          className="text-xs text-red-400 hover:text-red-300"
        >
          Reset
        </button>
        <button
          onClick={() => setShowFilters(false)}
          className="text-xs text-primary font-bold hover:text-primary/80"
        >
          Done
        </button>
      </div>
    </m.div>
  );
}
