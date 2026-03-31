"use client";

import { useState } from "react";
import { ClipboardList, TrendingUp, TrendingDown } from "lucide-react";
import { Order } from "@/lib/api";
import { formatPrice, formatAmount, formatTimestamp, orderStatusClass, orderStatusLabel } from "@/lib/format";

interface OrderTableProps {
  orders: Order[];
  onCancel?: (orderId: number) => void;
  loading?: boolean;
}

type Filter = "all" | "open" | "filled" | "cancelled";
const statusMap: Record<Filter, number | null> = { all: null, open: 0, filled: 1, cancelled: 2 };

// Mobile card for a single order
function OrderCard({ order, onCancel }: { order: Order; onCancel?: (id: number) => void }) {
  const isBuy = order.is_buy;
  return (
    <div className="p-4 rounded-xl space-y-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1" style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: isBuy ? "var(--monad-cyan)" : "var(--monad-pink)" }}>
            {isBuy ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {isBuy ? "BUY" : "SELL"}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-primary)" }}>
            {order.pair || "MON/USDC"}
          </span>
        </div>
        <span className={orderStatusClass(order.status)}>{orderStatusLabel(order.status)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>Amount</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)" }}>{formatAmount(order.amount_in)}</span>
        </div>
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>Target</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--monad-orange)" }}>{formatPrice(parseFloat(order.target_price))}</span>
        </div>
        {order.status === 1 && order.fill_price && parseFloat(order.fill_price) > 0 && (
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>Fill</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#4ade80" }}>{formatPrice(parseFloat(order.fill_price))}</span>
          </div>
        )}
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>Created</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>{formatTimestamp(order.created_at)}</span>
        </div>
      </div>
      {order.status === 0 && onCancel && (
        <button
          onClick={() => onCancel(order.id)}
          className="w-full py-2 rounded-lg text-center"
          style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)", background: "transparent", cursor: "pointer" }}
        >
          Cancel Order
        </button>
      )}
    </div>
  );
}

export function OrderTable({ orders, onCancel, loading }: OrderTableProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === statusMap[filter]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex gap-1.5 p-1">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-7 w-20 rounded-lg" />)}
        </div>
        <div className="hidden sm:block">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 w-full mb-px rounded" />)}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const FilterTabs = () => (
    <div className="flex gap-1.5 p-3 overflow-x-auto" style={{ borderBottom: "1px solid var(--border-color)" }}>
      {(["all", "open", "filled", "cancelled"] as Filter[]).map((f) => {
        const count = f === "all" ? orders.length : orders.filter((o) => o.status === statusMap[f]).length;
        const active = filter === f;
        return (
          <button key={f} onClick={() => setFilter(f)}
            style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 10px", borderRadius: 6, border: active ? "1px solid rgba(110,84,255,0.4)" : "1px solid transparent", background: active ? "rgba(110,84,255,0.15)" : "transparent", color: active ? "var(--monad-purple)" : "var(--text-muted)", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            {f} <span style={{ opacity: 0.6 }}>({count})</span>
          </button>
        );
      })}
    </div>
  );

  const Empty = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <ClipboardList size={28} color="var(--text-muted)" strokeWidth={1.2} style={{ opacity: 0.4 }} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
        No orders
      </span>
    </div>
  );

  return (
    <>
      {/* Mobile: card list */}
      <div className="sm:hidden space-y-3">
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
          <FilterTabs />
        </div>
        {filtered.length === 0
          ? <div className="rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}><Empty /></div>
          : filtered.map((order) => <OrderCard key={order.id} order={order} onCancel={onCancel} />)
        }
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
        <FilterTabs />
        {filtered.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                  {["ID", "Pair", "Type", "Amount", "Target", "Fill", "Status", "Created", ""].map((h, idx) => (
                    <th key={idx}
                      className={["Amount","Target","Fill"].includes(h) ? "text-right" : h === "Status" ? "text-center" : "text-left"}
                      style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", padding: "10px 14px", fontWeight: 400 }}
                    >{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid var(--border-color)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(110,84,255,0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", padding: "11px 14px" }}>#{order.id}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-primary)", padding: "11px 14px" }}>{order.pair || "MON/USDC"}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span className="flex items-center gap-1" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: order.is_buy ? "var(--monad-cyan)" : "var(--monad-pink)" }}>
                        {order.is_buy ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{order.is_buy ? "BUY" : "SELL"}
                      </span>
                    </td>
                    <td className="text-right" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-primary)", padding: "11px 14px" }}>{formatAmount(order.amount_in)}</td>
                    <td className="text-right" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--monad-orange)", padding: "11px 14px" }}>{formatPrice(parseFloat(order.target_price))}</td>
                    <td className="text-right" style={{ fontFamily: "var(--font-mono)", fontSize: 11, padding: "11px 14px" }}>
                      {order.status === 1 && order.fill_price && parseFloat(order.fill_price) > 0
                        ? <span style={{ color: "#4ade80" }}>{formatPrice(parseFloat(order.fill_price))}</span>
                        : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td className="text-center" style={{ padding: "11px 14px" }}>
                      <span className={orderStatusClass(order.status)}>{orderStatusLabel(order.status)}</span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", padding: "11px 14px", whiteSpace: "nowrap" }}>{formatTimestamp(order.created_at)}</td>
                    <td style={{ padding: "11px 14px" }}>
                      {order.status === 0 && onCancel && (
                        <button onClick={() => onCancel(order.id)}
                          style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", border: "1px solid var(--border-color)", background: "transparent", padding: "4px 8px", borderRadius: 6, cursor: "pointer" }}
                          onMouseEnter={(e) => { const b = e.currentTarget; b.style.color = "#f87171"; b.style.borderColor = "rgba(248,113,113,0.4)"; }}
                          onMouseLeave={(e) => { const b = e.currentTarget; b.style.color = "var(--text-muted)"; b.style.borderColor = "var(--border-color)"; }}
                        >Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
