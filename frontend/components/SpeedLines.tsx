"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

// The "Direction" motif — curved chevron speed lines
// derived from Monad's brand guidelines
export function SpeedLines({ opacity = 0.06, className = "" }: { opacity?: number; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const lines = containerRef.current.querySelectorAll(".speed-line-group");
    lines.forEach((line, i) => {
      gsap.to(line, {
        x: "+=80",
        duration: 3.5 + i * 0.4,
        ease: "none",
        repeat: -1,
        yoyo: false,
        delay: -i * 0.8,
        modifiers: {
          x: (x) => `${parseFloat(x) % 160}px`,
        },
      });
    });
    return () => gsap.killTweensOf(lines);
  }, []);

  const chevrons = Array.from({ length: 8 });

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ opacity }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {chevrons.map((_, i) => {
          const y = 80 + i * 100;
          const offset = (i % 2) * -80;
          return (
            <g key={i} className="speed-line-group" transform={`translate(${offset}, 0)`}>
              {/* A gentle chevron ">" shape */}
              <path
                d={`M ${-40 + i * 20} ${y} L ${20 + i * 20} ${y - 18} L ${-40 + i * 20} ${y - 36}`}
                stroke="var(--monad-purple)"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d={`M ${180 + i * 20} ${y} L ${240 + i * 20} ${y - 18} L ${180 + i * 20} ${y - 36}`}
                stroke="var(--monad-purple)"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d={`M ${400 + i * 20} ${y} L ${460 + i * 20} ${y - 18} L ${400 + i * 20} ${y - 36}`}
                stroke="var(--monad-purple)"
                strokeWidth="0.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d={`M ${620 + i * 20} ${y} L ${680 + i * 20} ${y - 18} L ${620 + i * 20} ${y - 36}`}
                stroke="var(--monad-cyan)"
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d={`M ${840 + i * 20} ${y} L ${900 + i * 20} ${y - 18} L ${840 + i * 20} ${y - 36}`}
                stroke="var(--monad-purple)"
                strokeWidth="0.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d={`M ${1060 + i * 20} ${y} L ${1120 + i * 20} ${y - 18} L ${1060 + i * 20} ${y - 36}`}
                stroke="var(--monad-purple)"
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d={`M ${1280 + i * 20} ${y} L ${1340 + i * 20} ${y - 18} L ${1280 + i * 20} ${y - 36}`}
                stroke="var(--monad-purple)"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
