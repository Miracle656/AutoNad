"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface ChatMessage {
  role: "user" | "agent";
  content: string;
  mono?: boolean;
}

const DEMO_SEQUENCE: ChatMessage[] = [
  { role: "user",  content: "Buy MON when price drops 10% below current, sell at +25%" },
  { role: "agent", content: "→ Parsing strategy via Claude claude-sonnet-4-20250514...", mono: true },
  {
    role: "agent",
    content: `{
  "action": "BUY",
  "token": "MON/USDC",
  "amount": "100 USDC",
  "targetPrice": "0.01980",
  "takeProfit": "0.02750",
  "stopLoss": null
}`,
    mono: true,
  },
  { role: "agent", content: "✓ Order placed on LimitOrderBook", mono: true },
  { role: "agent", content: "→ Monitoring MON/USDC... [$0.0220]", mono: true },
  { role: "agent", content: "✓ FILL: MON @ $0.01978 · tx: 0x4f2a...9e1c", mono: true },
];

function ChatBubble({ msg, visible }: { msg: ChatMessage; visible: boolean }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} transition-all duration-400`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
    >
      <div
        style={{
          maxWidth: "88%",
          padding: "10px 14px",
          borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          background: isUser ? "var(--monad-purple)" : "var(--bg-secondary)",
          border: isUser ? "none" : "1px solid var(--border-color)",
          fontFamily: msg.mono ? "var(--font-mono)" : "var(--font-body)",
          fontSize: msg.mono ? 11 : 13,
          color: isUser ? "white" : msg.content.startsWith("✓") ? "#4ade80" : "var(--text-secondary)",
          lineHeight: 1.65,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

export function StrategyDemo() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const leftRef     = useRef<HTMLDivElement>(null);
  const rightRef    = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<boolean[]>(Array(DEMO_SEQUENCE.length).fill(false));
  const started = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(rightRef.current, { x: 30, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.8,
        scrollTrigger: { trigger: rightRef.current, start: "top 80%" },
      });

      ScrollTrigger.create({
        trigger: leftRef.current,
        start: "top 70%",
        onEnter: () => {
          if (started.current) return;
          started.current = true;
          DEMO_SEQUENCE.forEach((_, i) => {
            setTimeout(() => {
              setVisible((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * 900);
          });
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-16 sm:py-24 md:py-28 px-4 sm:px-6 overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">

          {/* Chat mockup */}
          <div ref={leftRef}>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-card)" }}
            >
              {/* Title bar */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ borderBottom: "1px solid var(--border-color)", background: "var(--bg-tertiary)" }}
              >
                <div className="flex gap-1.5">
                  {["#FF5F57","#FFBD2E","#28C940"].map(c => (
                    <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.8 }} />
                  ))}
                </div>
                <span className="mono-sm ml-2" style={{ color: "var(--text-muted)" }}>AutoNad · Strategy Parser</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="dot-live" style={{ width: 5, height: 5 }} />
                  <span className="mono-sm" style={{ color: "var(--text-muted)", fontSize: 9 }}>LIVE</span>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex flex-col gap-3 p-5" style={{ minHeight: 280 }}>
                {DEMO_SEQUENCE.map((msg, i) => (
                  <ChatBubble key={i} msg={msg} visible={visible[i]} />
                ))}
              </div>
            </div>
          </div>

          {/* Copy */}
          <div ref={rightRef} className="space-y-6 opacity-0">
            <div className="section-label" style={{ justifyContent: "flex-start" }}>
              <span>Strategy Demo</span>
            </div>

            <h2 style={{ fontFamily: "var(--font-headline)", fontWeight: 700, fontSize: "clamp(26px, 3.5vw, 44px)", lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              Natural language.<br />
              <span style={{ color: "var(--monad-purple)" }}>On-chain precision.</span>
            </h2>

            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.75, maxWidth: 380 }}>
              Describe what you want in plain English. Claude extracts the parameters,
              confirms with you, and the agent watches prices around the clock.
              When conditions hit, the order fires — automatically.
            </p>

            <div className="space-y-3">
              {["No coding or config", "AI confirms before placing", "Agent executes 24/7"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(110,84,255,0.2)", border: "1px solid rgba(110,84,255,0.4)" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--monad-purple)" }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>{item}</span>
                </div>
              ))}
            </div>

            <Link href="/dashboard" className="btn-primary inline-flex" style={{ marginTop: 8 }}>
              Try It Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
