"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function LandingNav() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(navRef.current,
      { y: -16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.1 }
    );

    // Scroll listener
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 transition-all duration-300"
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid var(--border-color)" : "1px solid transparent",
        background: scrolled ? "rgba(14,9,28,0.85)" : "transparent",
        boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.3)" : "none",
        opacity: 0,
      }}
    >
      {/* Left: Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <svg width="28" height="28" viewBox="0 0 182 184" fill="none" className="flex-shrink-0">
          <path d="M90.5358 0C64.3911 0 0 65.2598 0 91.7593C0 118.259 64.3911 183.52 90.5358 183.52C116.681 183.52 181.073 118.258 181.073 91.7593C181.073 65.2609 116.682 0 90.5358 0ZM76.4273 144.23C65.4024 141.185 35.7608 88.634 38.7655 77.4599C41.7703 66.2854 93.62 36.2439 104.645 39.2892C115.67 42.3341 145.312 94.8846 142.307 106.059C139.302 117.234 87.4522 147.276 76.4273 144.23Z" fill="white"/>
        </svg>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-primary)" }}>
          AutoNad
        </span>
      </Link>

      {/* Center: Nav links */}
      <div className="hidden md:flex items-center gap-8">
        {[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Orders", href: "/orders" },
          { label: "Agent", href: "/agent" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", transition: "color 0.15s ease" }}
            className="hover:!text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Right: Theme + Connect */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
            if (!mounted) return null;
            if (!account || !chain) {
              return (
                <button onClick={openConnectModal} className="btn-primary" style={{ padding: "8px 18px" }}>
                  Connect Wallet
                </button>
              );
            }
            return (
              <button
                onClick={openAccountModal}
                className="btn-ghost"
                style={{ padding: "8px 14px", gap: 8 }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "var(--monad-cyan)", boxShadow: "0 0 6px var(--monad-cyan)" }}
                />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                  {account.displayName}
                </span>
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </nav>
  );
}
