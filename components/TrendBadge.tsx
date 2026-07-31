import { Trend } from "@/lib/analysis";

export default function TrendBadge({ trend, period }: { trend: Trend; period: number }) {
  if (trend === "unknown") return null;

  const above = trend === "above";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-sm border ${
        above ? "border-gain text-gain" : "border-loss text-loss"
      }`}
    >
      {above ? "▲" : "▼"} {above ? "Above" : "Below"} {period}-day average
    </span>
  );
}
