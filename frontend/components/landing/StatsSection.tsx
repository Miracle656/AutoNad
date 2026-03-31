"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SpeedLines } from "@/components/SpeedLines";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 1700, suffix: "+",  label: "Blitz Developers", prefix: "" },
  { value: 1,    suffix: "s",  label: "Settlement Time",  prefix: "<" },
  { value: 10,   suffix: "K",  label: "TPS",              prefix: "" },
  { value: 0.001,suffix: "",   label: "Avg Gas Fee (USD)", prefix: "$" },
];

function StatNumber({ value, prefix, suffix, label, index }: { value: number; prefix: string; suffix: string; label: string; index: number }) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!numRef.current) return;
    const el = numRef.current;
    const counter = { val: 0 };
    gsap.to(counter, {
      val: value, duration: 1.8, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
      onUpdate() {
        if (value < 1) {
          el.textContent = `${prefix}${counter.val.toFixed(3)}${suffix}`;
        } else {
          el.textContent = `${prefix}${Math.round(counter.val).toLocaleString()}${suffix}`;
        }
      },
    });
  }, [value, prefix, suffix]);

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        ref={numRef}
        style={{
          fontFamily: "var(--font-headline)",
          fontWeight: 700,
          fontSize: "clamp(40px, 5vw, 72px)",
          lineHeight: 1,
          color: "var(--text-primary)",
          letterSpacing: "-0.03em",
        }}
      >
        {prefix}0{suffix}
      </span>
      <span className="mono-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

export function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-24 md:py-28 px-4 sm:px-6 noise-overlay overflow-hidden"
      style={{ background: "var(--monad-dark-purple)" }}
    >
      <SpeedLines opacity={0.07} />

      {/* Top & bottom separators */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(110,84,255,0.5), rgba(133,230,255,0.3), transparent)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(110,84,255,0.5), rgba(133,230,255,0.3), transparent)" }} />

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 md:gap-12">
          {STATS.map((s, i) => (
            <StatNumber key={s.label} {...s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
