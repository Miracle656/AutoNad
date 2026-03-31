"use client";

import { useState, useEffect, useCallback } from "react";
import { Bot, Play, Pause, Wallet, BarChart3, RefreshCw, Zap } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { api, AgentDecision } from "@/lib/api";
import { explorerAddressUrl } from "@/lib/format";

export default function AgentPage() {
  const [activities, setActivities]   = useState<AgentDecision[]>([]);
  const [agentStatus, setAgentStatus] = useState<{ paused: boolean; agentAddress: string } | null>(null);
  const [loading, setLoading]         = useState(true);
  const [toggling, setToggling]       = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [activity, status] = await Promise.all([api.getActivity(), api.getAgentStatus()]);
      setActivities(activity); setAgentStatus(status);
    } catch { /* agent offline */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); const t = setInterval(loadData, 5000); return () => clearInterval(t); }, [loadData]);

  async function toggleAgent() {
    if (!agentStatus) return;
    setToggling(true);
    try {
      if (agentStatus.paused) { await api.resumeAgent(); setAgentStatus({ ...agentStatus, paused: false }); }
      else                    { await api.pauseAgent();  setAgentStatus({ ...agentStatus, paused: true }); }
    } catch (e: any) { alert(e.message); }
    finally { setToggling(false); }
  }

  const isPaused  = agentStatus?.paused ?? false;
  const agentAddr = agentStatus?.agentAddress || "";
  const actionCounts = activities.reduce((acc, a) => { acc[a.action] = (acc[a.action] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <>
      <TopBar title="Agent" />

      <div className="p-3 sm:p-4 md:p-6 space-y-4">
        {/* Top cards — stacked on mobile, 3-col on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

          {/* Status */}
          <div className="rounded-xl p-4 sm:p-5 space-y-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>Agent Status</span>
              <Bot size={13} color="var(--text-muted)" />
            </div>
            <div className="flex items-center gap-2">
              <span className={isPaused ? "dot-paused" : "dot-active"} style={{ width: 6, height: 6 }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 600, color: isPaused ? "var(--monad-orange)" : "var(--monad-cyan)" }}>
                {isPaused ? "PAUSED" : "ACTIVE"}
              </span>
            </div>
            <button
              onClick={toggleAgent} disabled={toggling || loading}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-colors"
              style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", border: `1px solid ${isPaused ? "rgba(133,230,255,0.3)" : "rgba(255,174,69,0.3)"}`, color: isPaused ? "var(--monad-cyan)" : "var(--monad-orange)", background: "transparent", cursor: "pointer" }}
            >
              {toggling
                ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : isPaused ? <><Play size={10} /> Resume Agent</> : <><Pause size={10} /> Pause Agent</>}
            </button>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: isPaused ? "var(--monad-orange)" : "var(--text-muted)", lineHeight: 1.6 }}>
              {isPaused ? "No orders will execute while paused." : "Checking prices every 5s."}
            </p>
          </div>

          {/* Wallet */}
          <div className="rounded-xl p-4 sm:p-5 space-y-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>Agent Wallet</span>
              <Wallet size={13} color="var(--text-muted)" />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--monad-cyan)", wordBreak: "break-all" }}>
              {agentAddr || "Not connected"}
            </div>
            {agentAddr && (
              <a href={explorerAddressUrl(agentAddr)} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", transition: "color 0.15s" }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--monad-purple)")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-muted)")}
              >
                View on Explorer ↗
              </a>
            )}
            <div style={{ paddingTop: 8, borderTop: "1px solid var(--border-color)" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Executes within your approved spending limits.
              </p>
            </div>
          </div>

          {/* Stats — spans full width on sm (2-col), normal on lg */}
          <div className="rounded-xl p-4 sm:p-5 space-y-3 sm:col-span-2 lg:col-span-1" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>Execution Stats</span>
              <BarChart3 size={13} color="var(--text-muted)" />
            </div>
            <div className="space-y-2">
              {Object.entries(actionCounts).slice(0, 4).map(([action, count]) => (
                <div key={action} className="flex items-center justify-between">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>{action.replace("_", " ")}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--monad-purple)" }}>{count}</span>
                </div>
              ))}
              {Object.keys(actionCounts).length === 0 && (
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>No executions yet</p>
              )}
            </div>
            <div style={{ paddingTop: 8, borderTop: "1px solid var(--border-color)" }}>
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>Total Decisions</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-primary)" }}>{activities.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity log */}
        <div className="rounded-xl p-4 sm:p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-primary)" }}>
                Activity Log
              </h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                Every AI decision with reasoning
              </p>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", border: "1px solid var(--border-color)", background: "transparent", cursor: "pointer" }}
              onMouseEnter={(e) => { const b = e.currentTarget; b.style.color = "var(--monad-purple)"; b.style.borderColor = "rgba(110,84,255,0.4)"; }}
              onMouseLeave={(e) => { const b = e.currentTarget; b.style.color = "var(--text-muted)"; b.style.borderColor = "var(--border-color)"; }}
            >
              <RefreshCw size={10} /> Refresh
            </button>
          </div>
          <ActivityFeed activities={activities} loading={loading} maxItems={50} />
        </div>

        {/* How it works */}
        <div className="flex items-start gap-3 px-4 sm:px-5 py-4 rounded-xl" style={{ background: "rgba(255,174,69,0.05)", border: "1px solid rgba(255,174,69,0.15)" }}>
          <Zap size={14} color="var(--monad-orange)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--monad-orange)" }}>
              How the Agent Works
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.7 }}>
              The AutoNad agent monitors simulated Monad prices every 5s. When a price condition
              matches an open order, it calls{" "}
              <code style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--monad-cyan)" }}>executeOrderSimulated()</code>{" "}
              on-chain, logs the AI decision, and broadcasts fills via WebSocket.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
