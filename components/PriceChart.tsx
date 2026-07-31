"use client";

import { PricePoint } from "@/lib/analysis";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function PriceChart({ data, smaPeriod = 20 }: { data: PricePoint[]; smaPeriod?: number }) {
  const trendingUp = data.length > 1 && data[data.length - 1].close >= data[0].close;

  return (
    <div className="bg-board-raised border border-board-line rounded-sm p-4">
      <div className="flex items-center gap-4 mb-2 text-xs">
        <span className="flex items-center gap-1.5 text-dim">
          <span className="w-3 h-0.5 inline-block" style={{ background: trendingUp ? "#4FA98C" : "#C1554B" }} />
          Price
        </span>
        <span className="flex items-center gap-1.5 text-dim">
          <span className="w-3 h-0.5 inline-block border-t border-dashed" style={{ borderColor: "#E3A857" }} />
          {smaPeriod}-day average
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              tick={{ fill: "#8B92A3", fontSize: 11, fontFamily: "IBM Plex Mono" }}
              tickLine={false}
              axisLine={{ stroke: "#2A3346" }}
              minTickGap={40}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "#8B92A3", fontSize: 11, fontFamily: "IBM Plex Mono" }}
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip
              contentStyle={{
                background: "#0E1420",
                border: "1px solid #2A3346",
                fontFamily: "IBM Plex Mono",
                fontSize: 12,
              }}
              labelStyle={{ color: "#8B92A3" }}
            />
            <Line
              type="monotone"
              dataKey="close"
              name="Price"
              stroke={trendingUp ? "#4FA98C" : "#C1554B"}
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="sma"
              name={`${smaPeriod}-day average`}
              stroke="#E3A857"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
