"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { LayoutDashboard, BarChart2, ClipboardList, Bot, Copy, Check, X } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { ThemeToggle } from "./ThemeToggle";
import { useSidebar } from "./SidebarContext";

const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio",  Icon: BarChart2 },
  { href: "/orders",    label: "Orders",     Icon: ClipboardList },
  { href: "/agent",     label: "Agent",      Icon: Bot },
];

function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg transition-colors"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", cursor: "pointer" }}
    >
      <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--monad-purple), var(--monad-cyan))" }} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
      {copied ? <Check size={11} color="#4ade80" /> : <Copy size={11} color="var(--text-muted)" />}
    </button>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { address } = useAccount();
  const pillRef  = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLAnchorElement[]>([]);
  const { open, close } = useSidebar();

  // Animate pill to active nav item
  useEffect(() => {
    const activeIdx = NAV.findIndex((n) => n.href === pathname);
    if (activeIdx === -1 || !pillRef.current) return;
    const target = itemRefs.current[activeIdx];
    if (!target) return;
    const parentTop = target.parentElement?.getBoundingClientRect().top ?? 0;
    const itemTop   = target.getBoundingClientRect().top - parentTop;
    gsap.to(pillRef.current, { y: itemTop, duration: 0.35, ease: "power3.out" });
  }, [pathname]);

  // Close sidebar on route change (mobile)
  useEffect(() => { close(); }, [pathname]);

  return (
    <aside
      className={`
        flex flex-col h-screen flex-shrink-0 z-40
        fixed lg:relative
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      style={{
        width: 220,
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-color)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-color)" }}>
        <Link href="/" className="flex items-center gap-2.5 group" onClick={close}>
          <svg width="26" height="26" viewBox="0 0 182 184" fill="none" className="flex-shrink-0">
            <path d="M90.5358 0C64.3911 0 0 65.2598 0 91.7593C0 118.259 64.3911 183.52 90.5358 183.52C116.681 183.52 181.073 118.258 181.073 91.7593C181.073 65.2609 116.682 0 90.5358 0ZM76.4273 144.23C65.4024 141.185 35.7608 88.634 38.7655 77.4599C41.7703 66.2854 93.62 36.2439 104.645 39.2892C115.67 42.3341 145.312 94.8846 142.307 106.059C139.302 117.234 87.4522 147.276 76.4273 144.23Z" fill="var(--monad-purple)"/>
          </svg>
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-primary)", fontWeight: 600 }}>
              AutoNad
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Monad Testnet
            </p>
          </div>
        </Link>
        {/* Close button — mobile only */}
        <button
          onClick={close}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded-lg"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-muted)", cursor: "pointer" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto relative">
        <div
          ref={pillRef}
          className="absolute left-3 right-3 pointer-events-none rounded-lg"
          style={{ height: 38, background: "rgba(110,84,255,0.12)", border: "1px solid rgba(110,84,255,0.2)", top: 0, opacity: NAV.some(n => n.href === pathname) ? 1 : 0 }}
        />
        <div className="space-y-0.5">
          {NAV.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                ref={(el) => { if (el) itemRefs.current[i] = el; }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg relative z-10 transition-colors duration-150"
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 11,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <item.Icon size={15} strokeWidth={isActive ? 2 : 1.5} style={{ color: isActive ? "var(--monad-purple)" : "inherit" }} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1 h-4 rounded-full" style={{ background: "var(--monad-purple)" }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Network badge */}
        <div className="mt-6 mx-1">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          >
            <span className="dot-live" style={{ width: 5, height: 5 }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)" }}>
              Monad Testnet
            </span>
          </div>
        </div>
      </nav>

      {/* Bottom: wallet + theme */}
      <div className="px-3 pb-4 space-y-2" style={{ borderTop: "1px solid var(--border-color)", paddingTop: 12 }}>
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
            if (!mounted) return null;
            if (!account || !chain) {
              return (
                <button onClick={openConnectModal} className="btn-primary w-full" style={{ justifyContent: "center", fontSize: 11, padding: "9px 16px" }}>
                  Connect Wallet
                </button>
              );
            }
            return <CopyAddress address={account.address || ""} />;
          }}
        </ConnectButton.Custom>
        <ThemeToggle className="w-full" />
      </div>
    </aside>
  );
}
