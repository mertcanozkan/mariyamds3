"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTheme, THEMES } from "@/components/theme-provider";

interface Props {
  competencies: Record<string, number>;
}

const LABELS: Record<string, string> = {
  junctions: "Junctions",
  motorway: "Motorway",
  townDriving: "Town",
  parking: "Parking",
  emergencyStop: "Emergency",
  roundabouts: "Roundabouts",
};

export function ProgressRadarChart({ competencies }: Props) {
  const { theme } = useTheme();
  const accentHex = THEMES.find((t) => t.name === theme)?.accent ?? "#F5A623";

  const data = Object.entries(competencies).map(([key, value]) => ({
    subject: LABELS[key] ?? key,
    value: Math.round(value),
    fullMark: 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={192}>
      <RadarChart data={data} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 10, fill: "#64748b" }}
        />
        <Tooltip
          formatter={(v: number) => [`${v}/10`, "Score"]}
          contentStyle={{ fontSize: 12 }}
        />
        <Radar
          name="Progress"
          dataKey="value"
          stroke={accentHex}
          fill={accentHex}
          fillOpacity={0.25}
          dot={{ r: 3, fill: accentHex }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
