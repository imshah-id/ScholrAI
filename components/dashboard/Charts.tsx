"use client";

import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export function ProfileRadar({ strength }: { strength: number }) {
  // Mock data breakdown derived from single strength score for MVP
  const data = [
    { subject: "GPA", A: Math.min(100, strength * 1.2), fullMark: 100 },
    { subject: "Tests", A: Math.min(100, strength * 0.9), fullMark: 100 },
    { subject: "Projects", A: Math.min(100, strength * 1.1), fullMark: 100 },
    { subject: "Essays", A: Math.min(100, strength * 0.8), fullMark: 100 },
    { subject: "Experience", A: Math.min(100, strength), fullMark: 100 },
  ];

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Profile"
            dataKey="A"
            stroke="#14b8a6"
            strokeWidth={2}
            fill="#14b8a6"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReadinessGraph({
  strength,
  startDate,
}: {
  strength: number;
  startDate?: string;
}) {
  // Generate a realistic looking "history" based on current strength and start date
  const end = new Date();
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago

  // Calculate 4 points: Start, 1/3, 2/3, End
  const getPointDate = (ratio: number) => {
    const timeDiff = end.getTime() - start.getTime();
    const date = new Date(start.getTime() + timeDiff * ratio);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const data = [
    { name: getPointDate(0), score: Math.round(strength * 0.4) }, // Start date
    { name: getPointDate(0.33), score: Math.round(strength * 0.6) },
    { name: getPointDate(0.66), score: Math.round(strength * 0.8) },
    { name: "Today", score: strength },
  ];

  return (
    <div className="h-[200px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#334155"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              borderColor: "#334155",
              color: "#f8fafc",
            }}
            itemStyle={{ color: "#facc15" }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#facc15"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorScore)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
