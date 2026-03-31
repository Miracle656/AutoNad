'use client'
import { useRef, useEffect, useState } from 'react'

type Strategy = {
  name:    string
  pct:     number
  desc:    string
}

const STRATEGIES: Strategy[] = [
  { name: 'DCA STRATEGY',     pct: 67, desc: 'Weekly buys into MON at market price' },
  { name: 'LIMIT BUY -10%',   pct: 45, desc: 'Buy when MON drops 10% below current price' },
  { name: 'TAKE PROFIT +25%', pct: 28, desc: 'Auto-sell at 25% profit target' },
]

export function OrdersSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-32 px-8 md:px-16"
      style={{ background: '#120D24' }}
    >
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Left — Live Order Activity */}
        <div
          className="rounded-xl p-10"
          style={{
            border:     '1px solid rgba(110,84,255,0.25)',
            background: 'linear-gradient(135deg, rgba(110,84,255,0.06) 0%, transparent 100%)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-8">
            <span className="font-mono text-[11px] tracking-widest text-monad-purple">
              LIVE ORDERS
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
          </div>

          {/* Featured stat */}
          <div
            className="font-display text-monad-purple mb-2 tabular-nums"
            style={{ fontSize: 80, lineHeight: 1 }}
          >
            1,247
          </div>
          <p className="font-mono text-[11px] tracking-widest text-muted mb-4">
            ORDERS EXECUTED THIS WEEK
          </p>

          {/* Change indicator */}
          <span
            className="inline-flex items-center font-mono text-[11px] tracking-widest text-cyan px-2 py-1 rounded-full mb-6"
            style={{
              background: 'rgba(133,230,255,0.10)',
              border:     '1px solid rgba(133,230,255,0.20)',
            }}
          >
            +12.4%
          </span>

          <p className="font-body text-sm text-white/50 leading-relaxed">
            AutoNad's AI agent has been executing orders around the clock. Every trade is settled on-chain in under one second.
          </p>
        </div>

        {/* Right — Strategy allocation cards */}
        <div className="flex flex-col gap-3">
          {STRATEGIES.map((strat) => (
            <div
              key={strat.name}
              className="rounded-lg p-6"
              style={{
                background: '#0E091C',
                border:     '1px solid rgba(110,84,255,0.10)',
              }}
            >
              {/* Row 1 */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] tracking-widest text-white">
                  {strat.name}
                </span>
                <span className="font-mono text-[11px] tracking-widest text-monad-purple">
                  {strat.pct}%
                </span>
              </div>

              {/* Progress bar */}
              <div
                className="h-[2px] rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width:      triggered ? `${strat.pct}%` : '0%',
                    background: 'linear-gradient(90deg, #6E54FF, #85E6FF)',
                    transition: 'width 1500ms ease-out',
                  }}
                />
              </div>

              {/* Row 3 */}
              <p className="font-body text-xs text-muted mt-2">
                {strat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
