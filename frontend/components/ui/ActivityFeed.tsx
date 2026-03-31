"use client";

import React from "react";
import { TrendingUp, TrendingDown, Plus, Activity } from "lucide-react";
import { AgentDecision } from "@/lib/api";
import { formatTimeAgo, formatPrice, explorerTxUrl, formatAddress } from "@/lib/format";

interface ActivityFeedProps {
  activities: AgentDecision[];
  loading?: boolean;
  maxItems?: number;
}

function ActionIcon({ action }: { action: string }) {
  const up = action.includes("BUY") || action.includes("buy");
  const down = action.includes("SELL") || action.includes("sell");
  const place = action.includes("PLACE");

  const color = up ? "var(--monad-cyan)" : down ? "var(--monad-pink)" : place ? "var(--monad-purple)" : "var(--text-muted)";
  const bg   = up ? "rgba(133,230,255,0.1)" : down ? "rgba(255,142,228,0.1)" : place ? "rgba(110,84,255,0.1)" : "var(--bg-card)";
  const Icon = up ? TrendingUp : down ? TrendingDown : place ? Plus : Activity;

  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
      <Icon size={12} color={color} />
    </div>
  );
}

export function ActivityFeed({ activities, loading, maxItems = 10 }: ActivityFeedProps) {
  const items = activities.slice(0, maxItems);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="skeleton w-7 h-7 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <Activity size={20} color="var(--text-muted)" strokeWidth={1.5} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          No activity yet
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {items.map((activity, idx) => (
        <div
          key={activity.id}
          className="flex gap-3 items-start px-2 py-2.5 rounded-lg transition-colors"
          style={{ animationDelay: `${idx * 30}ms` }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(110,84,255,0.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <ActionIcon action={activity.action} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--monad-purple)", fontWeight: 600 }}>
                {activity.action.replace("_", " ")}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", flexShrink: 0 }}>
                {formatTimeAgo(activity.timestamp)}
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.5 }}>
              {activity.reasoning}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--monad-cyan)" }}>
                @ {formatPrice(activity.price)}
              </span>
              {activity.txHash && (
                <a
                  href={explorerTxUrl(activity.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", transition: "color 0.15s" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--monad-purple)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-muted)")}
                >
                  {formatAddress(activity.txHash, 8)} ↗
                </a>
              )}
              {!activity.success && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#f87171" }}>failed</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
