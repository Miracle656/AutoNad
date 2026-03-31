"use client";

import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useSidebar } from "./SidebarContext";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

interface TopBarProps { title: string; }

export function TopBar({ title }: TopBarProps) {
  const [price, setPrice] = useState<number | null>(null);
  const [trend, setTrend] = useState<"up" | "down" | "flat">("flat");
  const priceRef = useRef<HTMLSpanElement>(null);
  const { on }   = useWebSocket(WS_URL);
  const { toggle } = useSidebar();

  useEffect(() => {
    const unsub = on("price_update", (data: any) => {
      if (data.pair !== "MON/USDC") return;
      setPrice((prev) => {
        if (prev !== null) setTrend(data.price > prev ? "up" : "down");
        if (priceRef.current) {
          priceRef.current.classList.remove("price-flash-up", "price-flash-down");
          void priceRef.current.offsetWidth;
          priceRef.current.classList.add(data.price > (prev || 0) ? "price-flash-up" : "price-flash-down");
        }
        return data.price;
      });
    });

    const unsubSnap = on("prices_snapshot", (data: any) => {
      if (data["MON/USDC"]) setPrice(data["MON/USDC"]);
    });

    return () => { unsub(); unsubSnap(); };
  }, [on]);

  const priceColor = trend === "up" ? "#4ade80" : trend === "down" ? "#f87171" : "var(--monad-cyan)";

  return (
    <header
      className="flex items-center justify-between px-3 sm:px-6 h-14 sticky top-0 z-20"
      style={{
        borderBottom: "1px solid var(--border-color)",
        background: "var(--bg-secondary)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-muted)", cursor: "pointer", flexShrink: 0 }}
          aria-label="Open menu"
        >
          <Menu size={15} />
        </button>
        <h1 style={{ fontFamily: "var(--font-headline)", fontWeight: 600, fontSize: 17, color: "var(--text-primary)" }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Price ticker */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
        >
          <span className="hidden sm:inline" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em" }}>
            MON/USDC
          </span>
          <span
            ref={priceRef}
            style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: priceColor, transition: "color 0.3s ease" }}
          >
            {price ? `$${price.toFixed(4)}` : "—"}
          </span>
          <span style={{ fontSize: 10, color: priceColor }}>
            {trend === "up" ? "▲" : trend === "down" ? "▼" : ""}
          </span>
        </div>

        {/* Network — hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="dot-live" style={{ width: 5, height: 5 }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Monad Testnet
          </span>
        </div>
      </div>
    </header>
  );
}
