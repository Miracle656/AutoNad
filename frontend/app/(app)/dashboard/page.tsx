"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAccount } from "wagmi";
import { Bot, Zap, TrendingUp, ListOrdered, AlertTriangle, Play, Pause, Plus } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { MetricCard } from "@/components/ui/MetricCard";
import { PriceChart } from "@/components/ui/PriceChart";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { StrategyModal } from "@/components/StrategyModal";
import { api, PriceData, AgentDecision, Order, createWebSocket } from "@/lib/api";
import { gsap } from "@/lib/gsap";

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [showStrategy, setShowStrategy]   = useState(false);
  const [priceData, setPriceData]         = useState<PriceData | null>(null);
  const [activities, setActivities]       = useState<AgentDecision[]>([]);
  const [orders, setOrders]               = useState<Order[]>([]);
  const [agentPaused, setAgentPaused]     = useState(false);
  const [loading, setLoading]             = useState(true);
  const wsRef   = useRef<WebSocket | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    try {
      const [price, activity] = await Promise.all([api.getPrice("MON/USDC"), api.getActivity()]);
      setPriceData(price);
      setActivities(activity);
    } catch { /* agent may not be running */ }
    if (address) {
      try { const userOrders = await api.getOrders(address); setOrders(userOrders); } catch { /* ignore */ }
    }
    setLoading(false);
  }, [address]);

  useEffect(() => {
    loadData();
    wsRef.current = createWebSocket((msg) => {
      if (msg.type === "price_update" && msg.data.pair === "MON/USDC") {
        setPriceData((prev) => {
          if (!prev) return prev;
          return { ...prev, price: msg.data.price, history: [...prev.history.slice(-99), { timestamp: msg.data.timestamp, price: msg.data.price, volume: 0, change24h: 0 }] };
        });
      }
      if (msg.type === "order_placed" || msg.type === "order_cancelled") {
        if (address) api.getOrders(address).then(setOrders).catch(() => {});
      }
      if (msg.type === "agent_status") setAgentPaused(msg.data.paused);
    });
    return () => wsRef.current?.close();
  }, [address, loadData]);

  useEffect(() => {
    const timer = setInterval(() => { api.getActivity().then(setActivities).catch(() => {}); }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".metric-card-anim");
    gsap.fromTo(cards, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: "power3.out" });
  }, [loading]);

  const openOrders   = orders.filter((o) => o.status === 0);
  const filledOrders = orders.filter((o) => o.status === 1);
  const pnl24h       = 3.47;

  async function toggleAgent() {
    try {
      if (agentPaused) { await api.resumeAgent(); setAgentPaused(false); }
      else             { await api.pauseAgent();  setAgentPaused(true);  }
    } catch { /* ignore */ }
  }

  return (
    <>
      <TopBar title="Dashboard" />

      <div className="p-3 sm:p-4 md:p-6 space-y-4">

        {!isConnected && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,174,69,0.07)", border: "1px solid rgba(255,174,69,0.2)" }}>
            <AlertTriangle size={14} color="var(--monad-orange)" className="flex-shrink-0" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--monad-orange)" }}>
              Connect your wallet to place orders and view your portfolio
            </span>
          </div>
        )}

        {/* Metric cards — 2 cols on mobile, 4 on desktop */}
        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="metric-card-anim">
            <MetricCard label="Portfolio Value" value="$4,312.80" sub="Vault + Wallet" icon={<TrendingUp size={13} />} accent="cyan" loading={loading} />
          </div>
          <div className="metric-card-anim">
            <MetricCard label="24h PnL" value={<span style={{ color: "#4ade80" }}>+{pnl24h.toFixed(2)}%</span>} sub="▲ Profitable" icon={<Zap size={13} />} accent="green" loading={loading} />
          </div>
          <div className="metric-card-anim">
            <MetricCard label="Open Orders" value={openOrders.length} sub={`${filledOrders.length} filled total`} icon={<ListOrdered size={13} />} accent="purple" loading={loading} />
          </div>

          {/* Agent status card */}
          <div
            className="metric-card-anim flex flex-col gap-2 p-4 sm:p-5 rounded-xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          >
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                Agent
              </span>
              <Bot size={13} color="var(--text-muted)" />
            </div>
            <div className="flex items-center gap-2">
              <span className={agentPaused ? "dot-paused" : "dot-active"} style={{ width: 6, height: 6 }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 600, color: agentPaused ? "var(--monad-orange)" : "var(--monad-cyan)" }}>
                {agentPaused ? "PAUSED" : "ACTIVE"}
              </span>
            </div>
            <button
              onClick={toggleAgent}
              className="flex items-center justify-center gap-1.5 mt-auto rounded-lg py-1.5 transition-colors"
              style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", border: `1px solid ${agentPaused ? "rgba(133,230,255,0.3)" : "rgba(255,174,69,0.3)"}`, color: agentPaused ? "var(--monad-cyan)" : "var(--monad-orange)", background: "transparent", cursor: "pointer" }}
            >
              {agentPaused ? <><Play size={9} /> Resume</> : <><Pause size={9} /> Pause</>}
            </button>
          </div>
        </div>

        {/* Chart + Activity — stacked on mobile, side-by-side on lg */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2 rounded-xl p-4 sm:p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            {priceData ? (
              <PriceChart pair="MON/USDC" history={priceData.history} currentPrice={priceData.price} height={200} />
            ) : (
              <div className="space-y-3">
                <div className="skeleton h-6 w-32" />
                <div className="skeleton h-[200px] w-full" />
              </div>
            )}
          </div>

          <div className="rounded-xl p-4 sm:p-5 flex flex-col" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-primary)" }}>
                Agent Activity
              </span>
              <div className="flex items-center gap-1.5">
                <span className="dot-live" style={{ width: 5, height: 5 }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>Live</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: 240 }}>
              <ActivityFeed activities={activities} loading={loading} maxItems={8} />
            </div>
          </div>
        </div>

        {/* CTA banner */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-5 rounded-xl"
          style={{ background: "rgba(110,84,255,0.07)", border: "1px solid rgba(110,84,255,0.18)" }}
        >
          <div>
            <h3 style={{ fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>
              Automate Your Trading
            </h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.6 }}>
              Describe your strategy in plain English. The AI agent sets and executes orders on-chain.
            </p>
          </div>
          <button
            onClick={() => setShowStrategy(true)}
            className="btn-primary flex items-center gap-2 whitespace-nowrap w-full sm:w-auto"
            style={{ justifyContent: "center" }}
          >
            <Plus size={13} /> Set Strategy
          </button>
        </div>

      </div>

      {showStrategy && (
        <StrategyModal
          onClose={() => setShowStrategy(false)}
          onOrderPlaced={() => { if (address) api.getOrders(address).then(setOrders).catch(() => {}); }}
        />
      )}
    </>
  );
}
