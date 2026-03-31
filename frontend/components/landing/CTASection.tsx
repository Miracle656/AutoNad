"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MonadLogomarkGlowing } from "./MonadLogo";

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current, { y: 60, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: contentRef.current, start: "top 80%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-28 px-6 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(110,84,255,0.25) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <div
          ref={contentRef}
          className="opacity-0 relative rounded-3xl overflow-hidden"
          style={{
            background: "rgba(14,9,28,0.85)",
            border: "1px solid rgba(110,84,255,0.25)",
            boxShadow: "0 0 80px rgba(110,84,255,0.2), 0 32px 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Inner glow top */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(110,84,255,0.8), rgba(133,230,255,0.4), transparent)" }}
          />

          <div className="flex flex-col items-center text-center px-8 py-16 gap-8">
            <MonadLogomarkGlowing size={80} />

            <div>
              <h2 className="font-headline font-bold text-white mb-4" style={{ fontSize: "clamp(28px, 4vw, 48px)" }}>
                Ready to trade intelligently?
              </h2>
              <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
                Connect your wallet, describe your strategy, and let AutoNad execute on your behalf — on-chain, 24/7, on Monad.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center gap-2.5 px-9 py-4 rounded-xl font-mono text-sm text-white overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #6E54FF 0%, #8B72FF 100%)",
                  boxShadow: "0 0 40px rgba(110,84,255,0.5)",
                }}
              >
                <span>Launch AutoNad</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <a
                href="https://testnet.monadexplorer.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-9 py-4 rounded-xl font-mono text-sm text-gray-400 hover:text-white transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                View on Explorer ↗
              </a>
            </div>

            {/* Bottom badge */}
            <div className="flex items-center gap-2 pt-4 border-t border-monad-purple border-opacity-20 w-full justify-center">
              <span className="font-mono text-xs text-gray-600">Built for</span>
              <span
                className="font-mono text-xs px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,174,69,0.1)", color: "#FFAE45", border: "1px solid rgba(255,174,69,0.25)" }}
              >
                Monad Blitz Nigeria 2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
