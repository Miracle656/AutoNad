import Link from 'next/link'

export function CTA() {
  return (
    <section
      className="relative py-40 px-8 md:px-16 text-center overflow-hidden"
      style={{ background: '#020108' }}
    >
      {/* Giant ghost watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden
      >
        <span
          className="font-display whitespace-nowrap"
          style={{
            fontSize:         320,
            lineHeight:       1,
            color:            'transparent',
            WebkitTextStroke: '1px rgba(110,84,255,0.04)',
            userSelect:       'none',
          }}
        >
          AUTONАД
        </span>
      </div>

      {/* Purple blob */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        <div
          style={{
            width:        600,
            height:       600,
            borderRadius: '50%',
            background:   '#6E54FF',
            filter:       'blur(200px)',
            opacity:      0.08,
          }}
        />
      </div>

      {/* Portal ring outline */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        <div
          style={{
            width:        500,
            height:       500,
            borderRadius: '30%',
            border:       '1px solid rgba(110,84,255,0.06)',
            transform:    'rotate(45deg)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        <p className="font-mono text-[11px] tracking-[3px] text-monad-purple mb-6">
          MONAD BLITZ NIGERIA 2026
        </p>

        <h2 className="font-display text-5xl md:text-6xl text-white mb-6 leading-none">
          Ready to Let AI{' '}
          <span className="text-monad-purple">Trade</span>{' '}
          For You?
        </h2>

        <p className="font-body text-lg text-white/45 max-w-md mx-auto mt-4 mb-10 leading-relaxed">
          Connect your wallet and describe your first strategy in plain English.
          AutoNad handles the rest — on Monad, at 10,000 TPS.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/dashboard"
            className="relative overflow-hidden bg-monad-purple text-white font-mono font-semibold text-[11px] tracking-widest px-8 py-4 rounded-lg hover:bg-purple-dim transition-colors"
          >
            LAUNCH APP →
          </Link>
          <a
            href="#"
            className="border border-white/10 hover:border-monad-purple/50 hover:text-monad-purple text-white font-mono text-[11px] tracking-widest px-8 py-4 rounded-lg transition-all"
          >
            READ THE DOCS
          </a>
        </div>

        <p
          className="font-mono text-muted mt-12"
          style={{ fontSize: 10, letterSpacing: '3px' }}
        >
          NON-CUSTODIAL · POWERED BY MONAD FOUNDATION · BUILT WITH CLAUDE AI
        </p>
      </div>
    </section>
  )
}
