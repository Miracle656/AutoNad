'use client'
import Link from 'next/link'

const TICKER_ITEMS = [
  'MON PRICE $0.022',
  'ORDERS EXECUTED 1,247',
  'AVG SETTLEMENT 0.8s',
  'AGENT UPTIME 99.9%',
  'MONAD TPS 10,000',
  'TESTNET LIVE ●',
  'OPEN ORDERS 89',
  'GAS FEE $0.001',
]

export function Hero() {
  return (
    <section
      className="relative h-screen flex flex-col overflow-hidden"
      style={{ background: '#0E091C' }}
    >
      {/* ── 1. Animated grid ────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none animate-grid-drift"
        style={{
          backgroundImage: `
            linear-gradient(rgba(110,84,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(110,84,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── 2. Color blobs ──────────────────────────────────────────────── */}
      {/* Purple — top-right, dominant */}
      <div
        className="absolute pointer-events-none animate-blob-float"
        style={{
          top: '-10%', right: '-10%',
          width: 500, height: 400,
          background: '#6E54FF',
          borderRadius: '50%',
          filter: 'blur(140px)',
          opacity: 'var(--blob-opacity, 0.14)',
        }}
      />
      {/* Cyan — bottom-left, smaller */}
      <div
        className="absolute pointer-events-none animate-blob-float-slow"
        style={{
          bottom: '-10%', left: '-10%',
          width: 400, height: 300,
          background: '#85E6FF',
          borderRadius: '50%',
          filter: 'blur(140px)',
          opacity: 'calc(var(--blob-opacity, 0.14) * 0.7)',
        }}
      />
      {/* Pink — center-left, smallest */}
      <div
        className="absolute pointer-events-none animate-blob-float"
        style={{
          top: '40%', left: '15%',
          width: 300, height: 300,
          background: '#FF8EE4',
          borderRadius: '50%',
          filter: 'blur(140px)',
          opacity: 'calc(var(--blob-opacity, 0.14) * 0.55)',
          animationDelay: '2s',
        }}
      />

      {/* ── 3. Speed lines ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute animate-speed-line"
            style={{
              top: `${12 + i * 17}%`,
              width: '60%',
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(110,84,255,0.8), transparent)',
              opacity: 0.04,
              animationDelay: `${i * 0.55}s`,
              animationDuration: `${3 + i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* ── 4. Portal (background) ──────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Radial glow behind portal */}
        <div
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(110,84,255,0.07) 0%, transparent 70%)',
          }}
        />
        {/* Portal diamond */}
        <div
          className="animate-portal-breathe"
          style={{
            width: 600,
            height: 600,
            borderRadius: '30%',
            border: '1px solid rgba(110,84,255,0.12)',
            transform: 'rotate(45deg)',
          }}
        />
      </div>

      {/* ── Hero content ────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl mx-auto w-full">

          {/* Eyebrow badge */}
          <div
            className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10"
            style={{
              border: '1px solid rgba(110,84,255,0.25)',
              background: 'rgba(110,84,255,0.08)',
              animationDelay: '0.2s',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            <span
              className="font-mono text-[11px] text-white/70"
              style={{ letterSpacing: '4px' }}
            >
              AI LIMIT ORDERS × MONAD TESTNET × 10,000 TPS
            </span>
          </div>

          {/* H1 */}
          <h1
            className="animate-fade-up font-display mb-8"
            style={{
              lineHeight: 0.9,
              animationDelay: '0.4s',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            <span
              className="block text-white"
              style={{ fontSize: 'clamp(56px, 8vw, 136px)' }}
            >
              AI-POWERED
            </span>
            {/* Outlined "TRADING." with solid purple dot */}
            <span className="block" style={{ fontSize: 'clamp(56px, 8vw, 136px)' }}>
              <span
                style={{
                  color: 'transparent',
                  WebkitTextStroke: '1.5px rgba(110,84,255,0.6)',
                }}
              >
                TRADING.
              </span>
              <span style={{ color: '#6E54FF', WebkitTextStroke: '0px' }}>•</span>
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="animate-fade-up font-body text-[17px] text-white/55 max-w-[480px] mx-auto mb-10 leading-relaxed"
            style={{
              animationDelay: '0.6s',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            Describe your strategy in plain English. AutoNad&apos;s AI agent places and executes
            limit orders on Monad — settled in under one second, non-custodial.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-up flex items-center justify-center gap-4 flex-wrap"
            style={{
              animationDelay: '0.8s',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            <Link
              href="/dashboard"
              className="bg-monad-purple text-white font-mono font-semibold text-[11px] tracking-widest px-8 py-4 rounded-lg hover:bg-purple-dim transition-colors"
            >
              LAUNCH APP →
            </Link>
            <a
              href="#"
              className="border text-white font-mono text-[11px] tracking-widest px-8 py-4 rounded-lg transition-all"
              style={{
                borderColor: 'rgba(255,255,255,0.10)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'rgba(110,84,255,0.5)'
                el.style.color = '#6E54FF'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.borderColor = 'rgba(255,255,255,0.10)'
                el.style.color = '#fff'
              }}
            >
              VIEW DOCS
            </a>
          </div>
        </div>
      </div>

      {/* ── Ticker bar ──────────────────────────────────────────────────── */}
      <div
        className="relative z-10 overflow-hidden"
        style={{
          borderTop: '1px solid rgba(110,84,255,0.1)',
          background: 'rgba(14,9,28,0.80)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="py-3 flex items-center">
          {/* Duplicated for seamless loop */}
          <div className="flex items-center animate-ticker whitespace-nowrap">
            {[0, 1].map((pass) => (
              <div key={pass} className="flex items-center">
                {TICKER_ITEMS.map((item, j) => (
                  <span key={j} className="flex items-center">
                    <span className="font-mono text-[11px] tracking-widest text-muted px-6">
                      {item}
                    </span>
                    <span
                      className="font-mono text-[11px]"
                      style={{ color: 'rgba(110,84,255,0.40)' }}
                    >
                      //
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
