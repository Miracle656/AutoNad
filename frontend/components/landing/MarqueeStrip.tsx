"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const ITEMS = [
  "MON/USDC $42.18 ▲ 3.4%",
  "LIMIT ORDER FILLED",
  "WETH/USDC $3,241.50 ▲ 1.2%",
  "DCA EXECUTED — WEEKLY",
  "WBTC/USDC $68,200 ▼ 0.8%",
  "STOP LOSS TRIGGERED",
  "AGENT ACTIVE — 5s SCAN",
  "ORDER #1042 PLACED",
];

export function MarqueeStrip() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const total = track.scrollWidth / 2;

    gsap.to(track, {
      x: -total,
      duration: 28,
      ease: "none",
      repeat: -1,
    });
  }, []);

  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div
      className="relative overflow-hidden py-4"
      style={{
        borderTop: "1px solid rgba(110,84,255,0.15)",
        borderBottom: "1px solid rgba(110,84,255,0.15)",
        background: "rgba(110,84,255,0.04)",
      }}
    >
      {/* Fade masks */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, #0E091C, transparent)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(-90deg, #0E091C, transparent)" }}
      />

      <div ref={trackRef} className="flex items-center gap-0 whitespace-nowrap" style={{ width: "max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="font-mono text-xs text-gray-500 px-6">{item}</span>
            <span className="text-monad-purple opacity-30">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
