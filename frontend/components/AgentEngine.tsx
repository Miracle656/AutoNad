const BULLETS = [
  'Parses plain English into structured order parameters via Claude AI',
  'Monitors Chainlink price feeds on Monad testnet in real-time',
  'Executes limit orders the instant price conditions are met',
  'Operates within your approved spending limits — fully non-custodial',
  'Logs every decision with reasoning for full transparency',
]

function PortalRings() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 380, height: 380 }}>
      {/* Glow behind */}
      <div
        className="absolute"
        style={{
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(110,84,255,0.25) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Ring 4 — outermost */}
      <div
        className="absolute animate-spin-reverse"
        style={{
          width: 380, height: 380,
          border: '1px solid rgba(255,142,228,0.10)',
          borderRadius: '20%',
          transform: 'rotate(45deg)',
        }}
      />
      {/* Ring 3 */}
      <div
        className="absolute animate-spin-slowest"
        style={{
          width: 280, height: 280,
          border: '1px solid rgba(133,230,255,0.20)',
          borderRadius: '24%',
          transform: 'rotate(45deg)',
        }}
      />
      {/* Ring 2 */}
      <div
        className="absolute animate-spin-slower"
        style={{
          width: 180, height: 180,
          border: '1px solid rgba(110,84,255,0.40)',
          borderRadius: '28%',
          transform: 'rotate(45deg)',
        }}
      />
      {/* Ring 1 — innermost */}
      <div
        className="absolute animate-spin-slow"
        style={{
          width: 100, height: 100,
          border: '2px solid #6E54FF',
          borderRadius: '30%',
          transform: 'rotate(45deg)',
        }}
      />

      {/* Center pulsing dot */}
      <div
        className="relative z-10 flex items-center justify-center animate-pulse-glow"
        style={{
          width: 64, height: 64,
          borderRadius: '50%',
          background: '#6E54FF',
        }}
      >
        <span
          className="font-mono text-white text-center leading-tight"
          style={{ fontSize: 9, letterSpacing: '1px' }}
        >
          AI
          <br />
          AGENT
        </span>
      </div>
    </div>
  )
}

export function AgentEngine() {
  return (
    <section
      className="py-32 px-8 md:px-16"
      style={{ background: '#020108' }}
    >
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">

        {/* Left — portal diagram */}
        <div className="flex items-center justify-center">
          <PortalRings />
        </div>

        {/* Right — content */}
        <div>
          <p className="font-mono text-[11px] tracking-[3px] text-monad-purple mb-4">
            THE ENGINE
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-white leading-none mb-6">
            Your Strategy.
            <br />
            Our Agent.
            <br />
            Monad&apos;s Speed.
          </h2>
          <p className="font-body text-white/55 leading-relaxed mb-4">
            AutoNad's agent runs 24/7, watching price feeds and waiting for your conditions to be met. It never sleeps, never misses a tick.
          </p>
          <p className="font-body text-white/55 leading-relaxed mb-10">
            Every action is logged with full reasoning — you always know exactly what the agent did and why, down to the millisecond.
          </p>

          {/* Bullets */}
          <ul className="space-y-0">
            {BULLETS.map((bullet, i) => (
              <li
                key={i}
                className="flex items-start gap-4 py-4 font-body text-white/70 text-sm leading-relaxed"
                style={{
                  borderBottom: i < BULLETS.length - 1
                    ? '1px solid rgba(255,255,255,0.05)'
                    : 'none',
                }}
              >
                <span className="font-mono text-monad-purple mt-0.5 shrink-0">→</span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
