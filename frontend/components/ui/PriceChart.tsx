"use client";

import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { PricePoint } from "@/lib/api";

interface PriceChartProps {
  pair: string;
  history: PricePoint[];
  currentPrice: number;
  height?: number;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as PricePoint;
  return (
    <div
      className="px-3 py-2 rounded-lg"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", fontFamily: "var(--font-mono)", fontSize: 11 }}
    >
      <div style={{ color: "var(--monad-cyan)" }}>${payload[0].value.toFixed(4)}</div>
      <div style={{ color: "var(--text-muted)", marginTop: 2 }}>
        {new Date(d.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

export function PriceChart({ pair, history, currentPrice, height = 200 }: PriceChartProps) {
  const data = history.slice(-60).map((p) => ({
    ...p,
    price: parseFloat(p.price.toFixed(4)),
    time: new Date(p.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  }));

  const firstPrice = data.length > 0 ? data[0].price : currentPrice;
  const isUp = currentPrice >= firstPrice;
  const trend = isUp ? "var(--monad-purple)" : "#f87171";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{pair}</span>
          <span
            className="px-2 py-0.5 rounded"
            style={{
              fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
              background: isUp ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
              color: isUp ? "#4ade80" : "#f87171",
            }}
          >
            {isUp ? "▲" : "▼"} live
          </span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 600, color: "var(--monad-cyan)" }}>
          ${currentPrice.toFixed(4)}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis
            dataKey="time"
            tick={{ fill: "var(--text-muted)" as string, fontSize: 9, fontFamily: "Roboto Mono" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fill: "var(--text-muted)" as string, fontSize: 9, fontFamily: "Roboto Mono" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
            width={58}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={currentPrice}
            stroke="var(--monad-cyan)"
            strokeDasharray="3 3"
            strokeWidth={1}
            strokeOpacity={0.4}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--monad-purple)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "var(--monad-cyan)", stroke: "var(--bg-primary)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
