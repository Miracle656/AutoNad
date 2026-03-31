"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Lock, AlertTriangle, X } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TokenBalance { symbol: string; name: string; balance: number; price: number; value: number; }

function getMockBalances(prices: Record<string, number>): TokenBalance[] {
  const monPrice = prices["MON/USDC"] || 42;
  const ethPrice = prices["WETH/USDC"] || 3250;
  return [
    { symbol: "MON",  name: "Monad",      balance: 500,  price: monPrice, value: 500 * monPrice  },
    { symbol: "USDC", name: "USD Coin",   balance: 1250, price: 1,        value: 1250            },
    { symbol: "WETH", name: "Wrapped ETH",balance: 0.25, price: ethPrice, value: 0.25 * ethPrice },
  ];
}

const COLORS = ["#6E54FF", "#85E6FF", "#FF8EE4"];

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg px-3 py-2" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
      <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{d.symbol}</div>
      <div style={{ color: "var(--monad-cyan)", marginTop: 2 }}>{formatPrice(d.value)}</div>
      <div style={{ color: "var(--text-muted)", marginTop: 1 }}>{d.percentage?.toFixed(1)}%</div>
    </div>
  );
}

function SimpleModal({ title, onClose, action, onConfirm }: { title: string; onClose: () => void; action: string; onConfirm: (amount: string) => void }) {
  const [amount, setAmount] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl p-5 sm:p-6 z-10" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", boxShadow: "0 0 40px rgba(110,84,255,0.25)" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-primary)" }}>{title}</h3>
          <button onClick={onClose} style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}><X size={16} /></button>
        </div>
        <input type="number" placeholder="Enter amount..." value={amount} onChange={(e) => setAmount(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 10, marginBottom: 12, background: "var(--bg-card)", border: "1px solid var(--border-color)", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
        />
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.6 }}>
          Vault interactions require a connected wallet and MON for gas.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1" style={{ justifyContent: "center" }}>Cancel</button>
          <button onClick={() => onConfirm(amount)} className="btn-primary flex-1" style={{ justifyContent: "center" }}>{action}</button>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const { isConnected } = useAccount();
  const [balances, setBalances]           = useState<TokenBalance[]>([]);
  const [loading, setLoading]             = useState(true);
  const [depositModal, setDepositModal]   = useState<string | null>(null);
  const [withdrawModal, setWithdrawModal] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try { const p = await api.getPrices(); setBalances(getMockBalances(p)); }
      catch { setBalances(getMockBalances({})); }
      setLoading(false);
    }
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  const totalValue = balances.reduce((sum, b) => sum + b.value, 0);
  const chartData  = balances.map((b) => ({ ...b, percentage: totalValue > 0 ? (b.value / totalValue) * 100 : 0 }));

  return (
    <>
      <TopBar title="Portfolio" />

      <div className="p-3 sm:p-4 md:p-6 space-y-4">

        {!isConnected && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,174,69,0.07)", border: "1px solid rgba(255,174,69,0.2)" }}>
            <AlertTriangle size={14} color="var(--monad-orange)" className="flex-shrink-0" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--monad-orange)" }}>
              Connect wallet to manage vault balances
            </span>
          </div>
        )}

        {/* Total value */}
        <div className="rounded-xl px-5 sm:px-6 py-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            Total Portfolio Value
          </span>
          {loading ? <div className="skeleton h-10 w-48 mt-2" /> : (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 700, color: "var(--monad-cyan)", lineHeight: 1.1, marginTop: 6 }}>
              {formatPrice(totalValue)}
            </p>
          )}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
            Vault + Wallet combined
          </span>
        </div>

        {/* Chart + Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-xl p-4 sm:p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-primary)", marginBottom: 16 }}>
              Allocation
            </h3>
            {loading ? <div className="skeleton h-48 w-full" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend formatter={(value) => <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-xl p-4 sm:p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-primary)", marginBottom: 16 }}>
              Token Balances
            </h3>
            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-14 w-full rounded-xl" />)}</div>
            ) : (
              <div className="space-y-2">
                {balances.map((token, i) => (
                  <div key={token.symbol} className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(110,84,255,0.06)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${COLORS[i]}22`, border: `1px solid ${COLORS[i]}55` }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--text-primary)" }}>{token.symbol.slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)" }}>{token.symbol}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)" }}>{formatPrice(token.value)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5 gap-2">
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{token.name}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", flexShrink: 0 }}>
                          {token.balance.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button onClick={() => setDepositModal(token.symbol)}
                        style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--monad-cyan)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 4 }}>
                        Deposit
                      </button>
                      <button onClick={() => setWithdrawModal(token.symbol)}
                        style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 4 }}>
                        Withdraw
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vault info */}
        <div className="flex items-start gap-3 px-4 sm:px-5 py-4 rounded-xl" style={{ background: "rgba(110,84,255,0.06)", border: "1px solid rgba(110,84,255,0.18)" }}>
          <Lock size={14} color="var(--monad-purple)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--monad-purple)" }}>AgentVault Contract</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.7 }}>
              Tokens are held in the <code style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--monad-cyan)" }}>AgentVault</code> contract.
              The AI agent can only spend within your approved limit. Contract:{" "}
              <code style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--monad-purple)", wordBreak: "break-all" }}>
                {process.env.NEXT_PUBLIC_AGENT_VAULT_CONTRACT || "Not deployed yet"}
              </code>
            </p>
          </div>
        </div>
      </div>

      {depositModal && <SimpleModal title={`Deposit ${depositModal}`} onClose={() => setDepositModal(null)} action="Deposit" onConfirm={(amount) => { console.log(`Depositing ${amount} ${depositModal}`); setDepositModal(null); }} />}
      {withdrawModal && <SimpleModal title={`Withdraw ${withdrawModal}`} onClose={() => setWithdrawModal(null)} action="Withdraw" onConfirm={(amount) => { console.log(`Withdrawing ${amount} ${withdrawModal}`); setWithdrawModal(null); }} />}
    </>
  );
}
