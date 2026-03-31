"use client";

import React from "react";

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: "purple" | "cyan" | "orange" | "pink" | "green" | "red";
  loading?: boolean;
}

const accentVars: Record<string, string> = {
  purple: "var(--monad-purple)",
  cyan:   "var(--monad-cyan)",
  orange: "var(--monad-orange)",
  pink:   "var(--monad-pink)",
  green:  "#4ade80",
  red:    "#f87171",
};

export function MetricCard({ label, value, sub, icon, accent = "cyan", loading }: MetricCardProps) {
  const color = accentVars[accent];
  return (
    <div
      className="flex flex-col gap-2 p-5 rounded-xl"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          {label}
        </span>
        {icon && <span style={{ color: "var(--text-muted)" }}>{icon}</span>}
      </div>

      {loading ? (
        <div className="skeleton h-8 w-32 mt-1" />
      ) : (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600, color, lineHeight: 1 }}>
          {value}
        </div>
      )}

      {sub && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  );
}
