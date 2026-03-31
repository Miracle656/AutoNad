"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { MonadPortal } from "@/components/MonadPortal";
import { SpeedLines } from "@/components/SpeedLines";

const WebGLHero = dynamic(() => import("@/components/WebGLHero").then(m => m.WebGLHero), { ssr: false });

// Manual char splitting — no SplitText plugin needed
function AnimatedHeadline() {
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);

  const line1 = "AI-Powered Trading.";
  const line2 = "Zero Custody.";

  useEffect(() => {
    const chars1 = line1Ref.current?.querySelectorAll(".char");
    const chars2 = line2Ref.current?.querySelectorAll(".char");
    if (!chars1 || !chars2) return;

    const tl = gsap.timeline({ delay: 0.5 });
    tl.fromTo(chars1, { y: "105%", opacity: 0 }, {
      y: "0%", opacity: 1, duration: 0.7, stagger: 0.025, ease: "power4.out",
    })
    .fromTo(chars2, { y: "105%", opacity: 0 }, {
      y: "0%", opacity: 1, duration: 0.7, stagger: 0.03, ease: "power4.out",
    }, "-=0.5");
  }, []);

  return (
    <h1
      style={{
        fontFamily: "var(--font-headline)",
        fontWeight: 700,
        lineHeight: 1.06,
        letterSpacing: "-0.02em",
        fontSize: "clamp(44px, 7.5vw, 96px)",
      }}
    >
      <div ref={line1Ref} className="overflow-hidden">
        {line1.split("").map((ch, i) => (
          <span
            key={i}
            className="char inline-block"
            style={{ color: "var(--text-primary)", whiteSpace: "pre" }}
          >
            {ch}
          </span>
        ))}
      </div>
      <div ref={line2Ref} className="overflow-hidden">
        {line2.split("").map((ch, i) => (
          <span
            key={i}
            className="char inline-block"
            style={{
              whiteSpace: "pre",
              color: i < 4 ? "var(--monad-purple)" : "var(--text-primary)",
            }}
          >
            {ch}
          </span>
        ))}
      </div>
    </h1>
  );
}

export function HeroSection() {
  const badgeRef  = useRef<HTMLDivElement>(null);
  const subRef    = useRef<HTMLParagraphElement>(null);
  const ctaRef    = useRef<HTMLDivElement>(null);
  const statsRef  = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(badgeRef.current,  { y: 20, opacity: 0, scale: 0.92 }, { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: "back.out(2)" })
      .fromTo(subRef.current,    { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 }, "+=0.55")
      .fromTo(ctaRef.current,    { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, "-=0.25")
      .fromTo(statsRef.current,  { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.2");

    // Portal entrance
    gsap.fromTo(portalRef.current, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1.4, ease: "power3.out", delay: 0.3 });
  }, []);

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-screen text-center overflow-hidden"
      style={{ paddingTop: "clamp(60px, 10vh, 80px)" }}
    >
      {/* WebGL canvas */}
      <div className="absolute inset-0">
        <WebGLHero />
      </div>

      {/* Speed lines */}
      <SpeedLines opacity={0.05} />

      {/* Portal — behind content */}
      <div ref={portalRef} className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none">
        <MonadPortal size={420} />
      </div>

      {/* Radial vignette for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 65% 55% at 50% 50%, transparent 0%, rgba(14,9,28,0.5) 65%, rgba(14,9,28,0.97) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6 px-4 sm:px-6 max-w-4xl mx-auto w-full">

        {/* Badge */}
        <div ref={badgeRef} style={{ opacity: 0 }}>
          <div
            className="inline-flex items-center gap-2.5"
            style={{
              padding: "6px 14px",
              border: "1px solid rgba(110,84,255,0.35)",
              borderRadius: "99px",
              background: "rgba(110,84,255,0.1)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--monad-light-purple)",
            }}
          >
            <span className="dot-live" />
            Built on Monad Testnet · Powered by Claude AI
          </div>
        </div>

        {/* Headline */}
        <AnimatedHeadline />

        {/* Subheadline */}
        <p
          ref={subRef}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(16px, 2vw, 19px)",
            color: "var(--text-secondary)",
            maxWidth: "500px",
            lineHeight: 1.7,
            opacity: 0,
          }}
        >
          Describe your strategy in plain English. AutoNad's AI agent places and executes
          limit orders autonomously on Monad — settled in under one second.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 w-full sm:w-auto" style={{ opacity: 0 }}>
          <Link
            href="/dashboard"
            className="btn-primary w-full sm:w-auto"
            style={{ padding: "12px 28px", fontSize: 12, justifyContent: "center" }}
          >
            Launch App <ArrowRight size={14} />
          </Link>
          <a
            href="#features"
            className="btn-ghost w-full sm:w-auto"
            style={{ padding: "12px 28px", fontSize: 12, justifyContent: "center" }}
          >
            See How It Works
          </a>
        </div>

        {/* Live stats bar */}
        <div
          ref={statsRef}
          className="flex flex-wrap items-center justify-center gap-0"
          style={{ opacity: 0, marginTop: 8 }}
        >
          {[
            { value: "10,000 TPS", label: null },
            { value: "< 1s", label: "FINALITY" },
            { value: "$0.001", label: "AVG FEE" },
          ].map((s, i) => (
            <div key={i} className="flex items-center">
              {i > 0 && (
                <div style={{ width: 1, height: 24, background: "var(--border-color)", margin: "0 12px" }} />
              )}
              <div className="flex flex-col items-center gap-0.5">
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--monad-cyan)", letterSpacing: "0.04em" }}>
                  {s.value}
                </span>
                {s.label && (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    {s.label}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Monad live dot */}
          <div style={{ width: 1, height: 24, background: "var(--border-color)", margin: "0 12px" }} />
          <div className="flex items-center gap-2">
            <span className="dot-live" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Monad Testnet Live
            </span>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ opacity: 0.35 }}>
        <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom, var(--monad-purple), transparent)" }} />
      </div>
    </section>
  );
}
