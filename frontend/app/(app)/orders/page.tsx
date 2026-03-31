"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { Plus, AlertTriangle, ClipboardList } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { OrderTable } from "@/components/ui/OrderTable";
import { StrategyModal } from "@/components/StrategyModal";
import { api, Order } from "@/lib/api";

export default function OrdersPage() {
  const { address, isConnected } = useAccount();
  const [orders, setOrders]             = useState<Order[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showStrategy, setShowStrategy] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!address) { setLoading(false); return; }
    try { const data = await api.getOrders(address); setOrders(data); }
    catch { /* agent not running */ }
    finally { setLoading(false); }
  }, [address]);

  useEffect(() => {
    loadOrders();
    const t = setInterval(loadOrders, 8000);
    return () => clearInterval(t);
  }, [loadOrders]);

  async function handleCancel(orderId: number) {
    if (!address) return;
    try { await api.cancelOrder(orderId, address); await loadOrders(); }
    catch (e: any) { alert(`Failed to cancel: ${e.message}`); }
  }

  const openCount   = orders.filter((o) => o.status === 0).length;
  const filledCount = orders.filter((o) => o.status === 1).length;

  return (
    <>
      <TopBar title="Orders" />

      <div className="p-3 sm:p-4 md:p-6 space-y-4">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600, color: "var(--text-primary)" }}>
                {orders.length}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                total
              </span>
            </div>
            <div style={{ width: 1, height: 18, background: "var(--border-color)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--monad-purple)" }}>{openCount} open</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#4ade80" }}>{filledCount} filled</span>
          </div>
          <button onClick={() => setShowStrategy(true)} className="btn-primary flex items-center gap-2 w-full sm:w-auto" style={{ justifyContent: "center" }}>
            <Plus size={12} /> New Order
          </button>
        </div>

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <ClipboardList size={32} color="var(--text-muted)" strokeWidth={1.2} style={{ opacity: 0.4 }} />
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: "rgba(255,174,69,0.07)", border: "1px solid rgba(255,174,69,0.2)" }}>
              <AlertTriangle size={12} color="var(--monad-orange)" />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--monad-orange)" }}>
                Connect wallet to view orders
              </span>
            </div>
          </div>
        ) : (
          <OrderTable orders={orders} onCancel={handleCancel} loading={loading} />
        )}
      </div>

      {showStrategy && (
        <StrategyModal onClose={() => setShowStrategy(false)} onOrderPlaced={loadOrders} />
      )}
    </>
  );
}
