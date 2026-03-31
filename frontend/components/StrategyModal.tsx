"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { X, CheckCircle } from "lucide-react";
import { api, ParsedStrategy } from "@/lib/api";

interface StrategyModalProps {
  onClose: () => void;
  onOrderPlaced?: () => void;
}

const EXAMPLE_STRATEGIES = [
  "Buy 100 MON when price drops to $38",
  "DCA $50 weekly into MON",
  "Sell half at +30% profit",
  "Buy the dip -10%",
];

const TOKEN_ADDRESSES: Record<string, string> = {
  MON:  "0x0000000000000000000000000000000000000000",
  USDC: "0x1111111111111111111111111111111111111111",
  WETH: "0x2222222222222222222222222222222222222222",
  WBTC: "0x3333333333333333333333333333333333333333",
};

function ConfirmRow({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  const color = accent ? "var(--monad-purple)" : warn ? "var(--monad-orange)" : "var(--text-primary)";
  return (
    <div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>{label}</span>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: accent ? 600 : 400, color, marginTop: 3 }}>{value}</p>
    </div>
  );
}

export function StrategyModal({ onClose, onOrderPlaced }: StrategyModalProps) {
  const { address } = useAccount();
  const [strategy, setStrategy] = useState("");
  const [parsed, setParsed]     = useState<ParsedStrategy | null>(null);
  const [step, setStep]         = useState<"input" | "confirm" | "success">("input");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [orderId, setOrderId]   = useState<number | null>(null);

  async function handleParse() {
    if (!strategy.trim()) return;
    setLoading(true); setError("");
    try { const result = await api.parseStrategy(strategy); setParsed(result); setStep("confirm"); }
    catch (e: any) { setError(e.message || "Failed to parse strategy"); }
    finally { setLoading(false); }
  }

  async function handleConfirm() {
    if (!parsed || !address) return;
    setLoading(true); setError("");
    try {
      const isBuy = parsed.action !== "SELL";
      const tokenIn  = isBuy ? TOKEN_ADDRESSES["USDC"] : (TOKEN_ADDRESSES[parsed.token] || TOKEN_ADDRESSES["MON"]);
      const tokenOut = isBuy ? (TOKEN_ADDRESSES[parsed.token] || TOKEN_ADDRESSES["MON"]) : TOKEN_ADDRESSES["USDC"];
      const result = await api.placeOrder({ owner: address, tokenIn, tokenOut, amountIn: String(parsed.amount), targetPrice: String(parsed.targetPrice), isBuyOrder: isBuy, pair: `${parsed.token}/USDC`, strategyText: strategy });
      setOrderId(result.orderId); setStep("success"); onOrderPlaced?.();
    } catch (e: any) { setError(e.message || "Failed to place order"); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }} onClick={onClose} />

      {/* Sheet on mobile, dialog on sm+ */}
      <div
        className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl z-10"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", boxShadow: "0 0 60px rgba(110,84,255,0.25)", maxHeight: "92dvh", overflowY: "auto" }}
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--border-color)" }} />
        </div>

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <div>
              <h2 style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(17px,4vw,20px)", fontWeight: 700, color: "var(--text-primary)" }}>
                Set Trading Strategy
              </h2>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>
                Describe your strategy in plain English
              </p>
            </div>
            <button onClick={onClose}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <X size={16} />
            </button>
          </div>

          {/* Step: Input */}
          {step === "input" && (
            <div className="space-y-4">
              <textarea rows={3}
                placeholder="e.g. Buy 100 MON when price drops to $38, sell half at $60..."
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleParse(); }}
                style={{ width: "100%", resize: "none", padding: "12px 14px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-color)", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-primary)", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }}
              />
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Examples</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_STRATEGIES.map((ex) => (
                    <button key={ex} onClick={() => setStrategy(ex)}
                      style={{ fontFamily: "var(--font-mono)", fontSize: 10, padding: "6px 11px", borderRadius: 20, border: "1px solid rgba(110,84,255,0.3)", color: "var(--monad-light-purple)", background: "transparent", cursor: "pointer" }}
                      onMouseEnter={(e) => { const b = e.currentTarget; b.style.background = "rgba(110,84,255,0.12)"; b.style.borderColor = "rgba(110,84,255,0.6)"; }}
                      onMouseLeave={(e) => { const b = e.currentTarget; b.style.background = "transparent"; b.style.borderColor = "rgba(110,84,255,0.3)"; }}
                    >{ex}</button>
                  ))}
                </div>
              </div>
              {error && <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", padding: "8px 12px", borderRadius: 8 }}>{error}</p>}
              <button onClick={handleParse} disabled={loading || !strategy.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</> : "Parse Strategy"}
              </button>
            </div>
          )}

          {/* Step: Confirm */}
          {step === "confirm" && parsed && (
            <div className="space-y-4">
              <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(110,84,255,0.08)", border: "1px solid rgba(110,84,255,0.2)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="dot-active" style={{ width: 5, height: 5 }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>AI Parsed Parameters</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <ConfirmRow label="Action"       value={parsed.action}              accent />
                  <ConfirmRow label="Token"        value={parsed.token} />
                  <ConfirmRow label="Amount"       value={String(parsed.amount)} />
                  <ConfirmRow label="Target Price" value={`$${parsed.targetPrice}`} />
                  {parsed.stopLoss   && <ConfirmRow label="Stop Loss"   value={`$${parsed.stopLoss}`}   warn />}
                  {parsed.takeProfit && <ConfirmRow label="Take Profit" value={`$${parsed.takeProfit}`} />}
                </div>
                {parsed.reasoning && (
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", borderTop: "1px solid rgba(110,84,255,0.2)", paddingTop: 10, marginTop: 4, lineHeight: 1.6 }}>{parsed.reasoning}</p>
                )}
              </div>
              {!address && <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--monad-orange)", background: "rgba(255,174,69,0.08)", border: "1px solid rgba(255,174,69,0.2)", padding: "8px 12px", borderRadius: 8 }}>Connect wallet to place order</p>}
              {error && <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", padding: "8px 12px", borderRadius: 8 }}>{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => { setStep("input"); setParsed(null); }} className="btn-ghost flex-1" style={{ justifyContent: "center" }}>Edit</button>
                <button onClick={handleConfirm} disabled={loading || !address} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Placing...</> : "Confirm & Place"}
                </button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(110,84,255,0.15)", border: "1px solid rgba(110,84,255,0.3)" }}>
                <CheckCircle size={28} color="var(--monad-purple)" strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-headline)", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Order Placed!</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.6 }}>
                  Order #{orderId} is active. The agent will execute when conditions are met.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(110,84,255,0.08)", border: "1px solid rgba(110,84,255,0.2)" }}>
                <span className="dot-active" style={{ width: 6, height: 6 }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--monad-cyan)" }}>Agent monitoring · 5s intervals</span>
              </div>
              <button onClick={onClose} className="btn-primary w-full" style={{ justifyContent: "center" }}>Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
