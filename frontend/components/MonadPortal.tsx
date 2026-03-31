"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

interface PortalProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

// The Monad "Portals" brand expression:
// concentric rounded-diamond shapes with radial purple light bleed
export function MonadPortal({ size = 320, className = "", animate = true }: PortalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate || !containerRef.current) return;
    const rings = containerRef.current.querySelectorAll(".portal-ring");

    // Breathing pulse on each ring with offset delay
    rings.forEach((ring, i) => {
      gsap.to(ring, {
        scale: 1.03,
        duration: 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.4,
      });
    });

    // Slow rotation on outermost
    gsap.to(rings[0], {
      rotation: 360,
      duration: 60,
      ease: "none",
      repeat: -1,
    });
    gsap.to(rings[rings.length - 1], {
      rotation: -360,
      duration: 90,
      ease: "none",
      repeat: -1,
    });

    return () => gsap.killTweensOf(rings);
  }, [animate]);

  const rings = [
    { scale: 1,    opacity: 0.12, blur: 0,  border: "rgba(110,84,255,0.4)" },
    { scale: 0.78, opacity: 0.18, blur: 0,  border: "rgba(110,84,255,0.55)" },
    { scale: 0.58, opacity: 0.30, blur: 0,  border: "rgba(133,230,255,0.3)" },
    { scale: 0.40, opacity: 0.50, blur: 0,  border: "rgba(110,84,255,0.8)" },
    { scale: 0.22, opacity: 0.80, blur: 0,  border: "rgba(221,215,254,0.6)" },
  ];

  const s = size;

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center pointer-events-none ${className}`}
      style={{ width: s, height: s }}
    >
      {/* Outer radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, rgba(110,84,255,0.25) 0%, rgba(110,84,255,0.08) 45%, transparent 75%)`,
          filter: "blur(30px)",
        }}
      />

      {/* Concentric rings — each is a rotated rounded square */}
      {rings.map((ring, i) => (
        <div
          key={i}
          className="portal-ring absolute"
          style={{
            width: s * ring.scale,
            height: s * ring.scale,
            border: `1px solid ${ring.border}`,
            borderRadius: "28%",
            transform: `rotate(45deg) scale(${ring.scale})`,
            opacity: ring.opacity,
            transformOrigin: "center",
            boxShadow: `0 0 ${20 - i * 3}px ${ring.border.replace(")", ", 0.3)").replace("rgba(", "rgba(")}`,
          }}
        />
      ))}

      {/* Center glow dot */}
      <div
        className="absolute w-3 h-3 rounded-full"
        style={{
          background: "var(--monad-purple)",
          boxShadow: "0 0 20px rgba(110,84,255,0.9), 0 0 40px rgba(110,84,255,0.5)",
        }}
      />

      {/* Logomark centered */}
      <svg
        width={s * 0.16}
        height={s * 0.16}
        viewBox="0 0 182 184"
        fill="none"
        className="absolute"
        style={{ opacity: 0.9 }}
      >
        <path
          d="M90.5358 0C64.3911 0 0 65.2598 0 91.7593C0 118.259 64.3911 183.52 90.5358 183.52C116.681 183.52 181.073 118.258 181.073 91.7593C181.073 65.2609 116.682 0 90.5358 0ZM76.4273 144.23C65.4024 141.185 35.7608 88.634 38.7655 77.4599C41.7703 66.2854 93.62 36.2439 104.645 39.2892C115.67 42.3341 145.312 94.8846 142.307 106.059C139.302 117.234 87.4522 147.276 76.4273 144.23Z"
          fill="white"
        />
      </svg>
    </div>
  );
}
