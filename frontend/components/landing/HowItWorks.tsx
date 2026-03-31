"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    num: "01",
    title: "Describe your strategy",
    desc: "Type anything. \"Buy 100 MON when price drops 10%\" or \"DCA weekly into MON.\" No code, no forms.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    accent: "#6E54FF",
    glow: "rgba(110,84,255,0.3)",
  },
  {
    num: "02",
    title: "AI parses your intent",
    desc: "Claude extracts precise parameters — token, price target, amount, stop-loss — and confirms with you before acting.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
      </svg>
    ),
    accent: "#85E6FF",
    glow: "rgba(133,230,255,0.3)",
  },
  {
    num: "03",
    title: "Agent executes on-chain",
    desc: "The agent monitors Monad prices every 5 seconds. When conditions are met, it executes the limit order automatically.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    accent: "#FF8EE4",
    glow: "rgba(255,142,228,0.3)",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headRef.current,
            start: "top 82%",
          },
        }
      );

      cardsRef.current.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            delay: i * 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="how" className="relative py-28 px-6 overflow-hidden">
      {/* Subtle bg grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(110,84,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(110,84,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-5xl mx-auto">
        <div ref={headRef} className="text-center mb-16 opacity-0">
          <p className="font-mono text-xs text-monad-purple uppercase tracking-widest mb-4">
            How it works
          </p>
          <h2
            className="font-headline font-bold text-white"
            style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
          >
            Three steps from idea
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-monad-purple to-monad-cyan">
              to executed trade
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              ref={(el) => { if (el) cardsRef.current[i] = el; }}
              className="relative group opacity-0"
            >
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:block absolute top-10 left-[calc(100%+12px)] w-6 border-t border-dashed z-10"
                  style={{ borderColor: "rgba(110,84,255,0.3)" }}
                />
              )}

              <div
                className="relative h-full p-7 rounded-2xl flex flex-col gap-5 transition-all duration-300 group-hover:-translate-y-1"
                style={{
                  background: "rgba(14,9,28,0.8)",
                  border: `1px solid rgba(110,84,255,0.18)`,
                  boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: `0 0 40px ${step.glow}`, border: `1px solid ${step.accent}44` }}
                />

                {/* Step num */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${step.accent}18`, color: step.accent, border: `1px solid ${step.accent}30` }}
                  >
                    {step.icon}
                  </div>
                  <span
                    className="font-mono text-4xl font-bold"
                    style={{ color: `${step.accent}20` }}
                  >
                    {step.num}
                  </span>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-lg mb-2 font-headline">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Terminal preview */}
        <div
          className="mt-12 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(14,9,28,0.9)",
            border: "1px solid rgba(110,84,255,0.2)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Terminal bar */}
          <div
            className="flex items-center gap-2 px-5 py-3"
            style={{ borderBottom: "1px solid rgba(110,84,255,0.15)", background: "rgba(110,84,255,0.05)" }}
          >
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
            <span className="ml-3 font-mono text-xs text-gray-600">autonad-agent — strategy-parser</span>
          </div>

          <div className="p-6 font-mono text-sm space-y-2">
            <TerminalLine delay={0.2} prefix=">" text='parse("buy 100 MON when price drops to $38")' color="text-gray-400" />
            <TerminalLine delay={0.6} prefix="" text="→ Calling Claude claude-sonnet-4-20250514..." color="text-gray-600" />
            <TerminalLine delay={1.1} prefix="" text='✓ Parsed: { action: "BUY", token: "MON",' color="text-monad-cyan" />
            <TerminalLine delay={1.3} prefix="" text='         amount: 100, targetPrice: 38 }' color="text-monad-cyan" />
            <TerminalLine delay={1.6} prefix="" text="→ Order #1042 placed on LimitOrderBook" color="text-monad-purple-light" />
            <TerminalLine delay={2.0} prefix="" text="→ Agent monitoring MON/USDC... [$42.14]" color="text-gray-500" />
            <TerminalLine delay={2.4} prefix="" text="✓ FILL: MON @ $37.98 · tx: 0x4f2a...9e1c" color="text-green-400" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TerminalLine({
  prefix,
  text,
  color,
  delay,
}: {
  prefix: string;
  text: string;
  color: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { opacity: 0, x: -10 },
      {
        opacity: 1,
        x: 0,
        duration: 0.4,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 90%",
        },
      }
    );
  }, [delay]);

  return (
    <div ref={ref} className={`flex gap-2 opacity-0 ${color}`}>
      {prefix && <span className="text-monad-purple">{prefix}</span>}
      <span>{text}</span>
    </div>
  );
}
