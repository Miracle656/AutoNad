"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

gsap.registerPlugin(ScrollTrigger);

// Monoweight SVG illustrations with blurred color circles underneath
function IllustrationDescribe() {
  return (
    <div className="relative w-full h-28 flex items-center justify-center">
      {/* Blurred color circles */}
      <div className="absolute w-20 h-20 rounded-full" style={{ background: "var(--monad-purple)", opacity: 0.18, filter: "blur(28px)", top: "10%", left: "20%" }} />
      <div className="absolute w-14 h-14 rounded-full" style={{ background: "var(--monad-cyan)", opacity: 0.12, filter: "blur(20px)", bottom: "10%", right: "25%" }} />
      {/* Line art */}
      <svg width="100" height="70" viewBox="0 0 100 70" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
        {/* Chat bubble */}
        <rect x="8" y="8" width="56" height="36" rx="8" />
        <path d="M16 28 L32 28" strokeDasharray="4 3" />
        <path d="M16 20 L44 20" />
        <path d="M16 36 L36 36" />
        <path d="M20 44 L20 50 L28 44" fill="none" />
        {/* Cursor */}
        <path d="M72 30 L80 44 L74 42 L72 50 L70 42 L64 44 Z" />
        {/* Dots indicating AI processing */}
        <circle cx="78" cy="15" r="2" fill="white" stroke="none" opacity="0.6" />
        <circle cx="84" cy="15" r="2" fill="white" stroke="none" opacity="0.4" />
        <circle cx="90" cy="15" r="2" fill="white" stroke="none" opacity="0.2" />
      </svg>
    </div>
  );
}

function IllustrationExecute() {
  return (
    <div className="relative w-full h-28 flex items-center justify-center">
      <div className="absolute w-16 h-16 rounded-full" style={{ background: "var(--monad-cyan)", opacity: 0.15, filter: "blur(24px)", top: "0%", left: "30%" }} />
      <div className="absolute w-20 h-20 rounded-full" style={{ background: "var(--monad-purple)", opacity: 0.12, filter: "blur(32px)", bottom: "0%", right: "20%" }} />
      <svg width="110" height="70" viewBox="0 0 110 70" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
        {/* Parallel execution lines */}
        <path d="M10 20 L50 20" />
        <path d="M10 35 L50 35" strokeDasharray="4 2" />
        <path d="M10 50 L50 50" />
        {/* Arrow heads */}
        <path d="M46 16 L50 20 L46 24" />
        <path d="M46 31 L50 35 L46 39" />
        <path d="M46 46 L50 50 L46 54" />
        {/* Merge point */}
        <circle cx="55" cy="35" r="5" />
        {/* Output */}
        <path d="M60 35 L90 35" />
        <path d="M86 31 L90 35 L86 39" />
        {/* Lightning bolt */}
        <path d="M80 15 L74 27 L80 27 L74 39" stroke="var(--monad-cyan)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function IllustrationSettle() {
  return (
    <div className="relative w-full h-28 flex items-center justify-center">
      <div className="absolute w-24 h-24 rounded-full" style={{ background: "var(--monad-purple)", opacity: 0.15, filter: "blur(30px)", top: "5%", left: "25%" }} />
      <div className="absolute w-14 h-14 rounded-full" style={{ background: "var(--monad-pink)", opacity: 0.1, filter: "blur(20px)", bottom: "0%", right: "20%" }} />
      <svg width="90" height="90" viewBox="0 0 90 90" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" style={{ opacity: 0.8 }}>
        {/* Concentric rings — Portal motif */}
        <circle cx="45" cy="45" r="38" strokeDasharray="4 3" strokeOpacity="0.4" />
        <circle cx="45" cy="45" r="28" strokeDasharray="6 2" strokeOpacity="0.6" />
        <circle cx="45" cy="45" r="18" strokeOpacity="0.8" />
        <circle cx="45" cy="45" r="8"  fill="rgba(110,84,255,0.3)" />
        <circle cx="45" cy="45" r="3"  fill="white" stroke="none" />
        {/* Tick mark */}
        <path d="M39 45 L43 49 L51 40" stroke="var(--monad-cyan)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

const CARDS = [
  {
    tag: "DESCRIBE",
    title: "Tell it your strategy.",
    body: "Type anything in plain English. AutoNad's AI parses your intent into precise on-chain parameters — no forms, no code.",
    illustration: <IllustrationDescribe />,
  },
  {
    tag: "EXECUTE",
    title: "Agent fires instantly.",
    body: "AutoNad monitors Monad prices every 3 seconds. The moment conditions are met, your order executes on-chain.",
    illustration: <IllustrationExecute />,
  },
  {
    tag: "SETTLE",
    title: "Settled in under 1 second.",
    body: "Monad's 10,000 TPS means your limit orders settle before anyone sees them coming. No frontrunning.",
    illustration: <IllustrationSettle />,
  },
];

export function FeaturesSection() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const headRef     = useRef<HTMLDivElement>(null);
  const cardsRef    = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headRef.current, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8,
        scrollTrigger: { trigger: headRef.current, start: "top 82%" },
      });

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card, { y: 50, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.75,
          scrollTrigger: { trigger: card, start: "top 86%" },
          delay: i * 0.12,
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="relative py-16 sm:py-24 md:py-28 px-4 sm:px-6 noise-overlay" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <div ref={headRef} className="opacity-0 space-y-10">
          <div className="section-label">How It Works</div>

          <h2
            className="text-center"
            style={{
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: "clamp(28px, 4.5vw, 52px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            From Strategy to Execution
            <br />
            <span style={{ color: "var(--monad-purple)" }}>in Seconds.</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mt-10 sm:mt-16">
          {CARDS.map((card, i) => (
            <div
              key={card.tag}
              ref={(el) => { if (el) cardsRef.current[i] = el; }}
              className="card group opacity-0"
              style={{ padding: "28px 24px 24px", position: "relative", overflow: "hidden" }}
            >
              {/* Hover spotlight */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: "radial-gradient(circle 160px at 50% 30%, rgba(110,84,255,0.08), transparent)" }}
              />

              {card.illustration}

              <div className="mt-4 space-y-2">
                <div
                  className="mono-sm"
                  style={{ color: "var(--monad-purple)" }}
                >
                  {card.tag}
                </div>
                <h3 style={{ fontFamily: "var(--font-headline)", fontWeight: 600, fontSize: 18, color: "var(--text-primary)" }}>
                  {card.title}
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {card.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
