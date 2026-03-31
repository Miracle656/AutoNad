import Link from "next/link";

export function LandingFooter() {
  return (
    <footer
      className="relative px-4 sm:px-6 py-10 sm:py-14"
      style={{ borderTop: "1px solid var(--border-color)", background: "var(--bg-primary)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 sm:gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <svg width="26" height="26" viewBox="0 0 182 184" fill="none">
                <path d="M90.5358 0C64.3911 0 0 65.2598 0 91.7593C0 118.259 64.3911 183.52 90.5358 183.52C116.681 183.52 181.073 118.258 181.073 91.7593C181.073 65.2609 116.682 0 90.5358 0ZM76.4273 144.23C65.4024 141.185 35.7608 88.634 38.7655 77.4599C41.7703 66.2854 93.62 36.2439 104.645 39.2892C115.67 42.3341 145.312 94.8846 142.307 106.059C139.302 117.234 87.4522 147.276 76.4273 144.23Z" fill="white"/>
              </svg>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-primary)" }}>
                AutoNad
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", maxWidth: 220, lineHeight: 1.65 }}>
              AI-powered DeFi portfolio manager. Non-custodial. On Monad.
            </p>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(255,174,69,0.08)", border: "1px solid rgba(255,174,69,0.2)" }}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--monad-orange)" }}>
                Monad Blitz Nigeria 2026
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-x-8 sm:gap-x-14 gap-y-3">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Orders", href: "/orders" },
              { label: "Portfolio", href: "/portfolio" },
              { label: "Agent", href: "/agent" },
              { label: "Explorer", href: "https://testnet.monadexplorer.com" },
              { label: "Monad", href: "https://monad.xyz" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", transition: "color 0.15s" }}
                className="hover:!text-white"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Chain */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="dot-live" />
              <span className="mono-sm" style={{ color: "var(--text-muted)" }}>Monad Testnet</span>
            </div>
            <p className="mono-sm" style={{ color: "var(--text-muted)", opacity: 0.5 }}>chainId: 10143</p>
            <p className="mono-sm" style={{ color: "var(--text-muted)", opacity: 0.5 }}>rpc: testnet-rpc.monad.xyz</p>
          </div>
        </div>

        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 mt-10 pt-6"
          style={{ borderTop: "1px solid var(--border-color)" }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em" }}>
            © 2026 AUTONAD · MIT LICENSE
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em" }}>
            POWERED BY MONAD · CLAUDE · ETHERS.JS
          </span>
        </div>
      </div>
    </footer>
  );
}
