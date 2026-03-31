'use client'
import { useRef, useEffect, useState } from 'react'

const USER_MSG = 'buy mon when price drops 10%, sell half at +25% profit, stop loss at -15%'

const JSON_RESPONSE = {
  action:      'BUY',
  token:       'MON',
  amount:      100,
  targetPrice: 0.0198,
  takeProfit:  0.0275,
  stopLoss:    0.0187,
  reasoning:   'Buy MON at -10% dip, take profit at +25%, stop loss at -15%',
}

const TX_HASH = '0x3a7f...c91e'

// Settlement comparison data (relative heights, last = Monad)
const SETTLEMENT_BARS = [
  { label: 'ETH',   height: 90, color: 'rgba(110,84,255,0.25)' },
  { label: 'L2',    height: 55, color: 'rgba(110,84,255,0.30)' },
  { label: 'SOL',   height: 30, color: 'rgba(110,84,255,0.40)' },
  { label: 'MONAD', height: 6,  color: '#85E6FF' },
]

// Parallel execution rows
const EXEC_ROWS = [
  [1, 1, 1, 0, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0, 0],
]

function useTypewriter(text: string, trigger: boolean, speed = 28) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    if (!trigger) return
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [trigger, text, speed])

  return displayed
}

function JsonView({ data }: { data: Record<string, unknown> }) {
  return (
    <pre className="text-[11px] leading-relaxed" style={{ fontFamily: 'var(--font-mono)' }}>
      <span style={{ color: 'rgba(255,255,255,0.30)' }}>{'{'}</span>{'\n'}
      {Object.entries(data).map(([k, v]) => (
        <span key={k}>
          {'  '}
          <span style={{ color: 'rgba(110,84,255,0.70)' }}>"{k}"</span>
          <span style={{ color: 'rgba(255,255,255,0.30)' }}>: </span>
          {typeof v === 'string' ? (
            <span style={{ color: '#85E6FF' }}>"{v}"</span>
          ) : (
            <span style={{ color: '#FFAE45' }}>{String(v)}</span>
          )}
          <span style={{ color: 'rgba(255,255,255,0.30)' }}>,</span>
          {'\n'}
        </span>
      ))}
      <span style={{ color: 'rgba(255,255,255,0.30)' }}>{'}'}</span>
    </pre>
  )
}

export function DemoSection() {
  const sectionRef   = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [showAgent, setShowAgent] = useState(false)

  const typedUser = useTypewriter(USER_MSG, visible, 24)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setShowAgent(true), USER_MSG.length * 24 + 400)
    return () => clearTimeout(t)
  }, [visible])

  const cardStyle: React.CSSProperties = {
    background: '#120D24',
    border:     '1px solid rgba(110,84,255,0.10)',
    borderRadius: 12,
    overflow:   'hidden',
  }

  return (
    <section
      ref={sectionRef}
      className="py-32 px-8 md:px-16"
      style={{ background: '#020108' }}
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <p className="font-mono text-[11px] tracking-[3px] text-monad-purple mb-4">LIVE DEMO</p>
        <h2 className="font-display text-5xl md:text-6xl text-white mb-16 leading-none">
          See It In Action.
        </h2>

        {/* Grid */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: '1.8fr 1fr', gridTemplateRows: 'auto' }}
        >
          {/* Left — Chat terminal (full height) */}
          <div style={{ ...cardStyle, gridRow: '1 / span 2' }}>
            {/* Terminal header */}
            <div
              className="flex items-center gap-2 px-5 py-4"
              style={{ borderBottom: '1px solid rgba(110,84,255,0.08)' }}
            >
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-orange/70" />
              <span className="w-3 h-3 rounded-full bg-monad-purple/70" />
              <span
                className="ml-4 font-mono text-[11px] tracking-widest text-muted"
              >
                AUTONАД AGENT
              </span>
            </div>

            <div className="p-8 flex flex-col gap-6 min-h-[480px]">
              {/* User bubble */}
              {visible && (
                <div className="flex justify-end">
                  <div
                    className="max-w-[80%] rounded-xl p-4 font-mono text-sm text-white"
                    style={{
                      background: 'rgba(110,84,255,0.15)',
                      border:     '1px solid rgba(110,84,255,0.25)',
                      fontSize:   13,
                    }}
                  >
                    {typedUser}
                    {typedUser.length < USER_MSG.length && (
                      <span className="inline-block w-0.5 h-4 bg-monad-purple animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>
                </div>
              )}

              {/* Agent bubble */}
              {showAgent && (
                <div className="flex justify-start">
                  <div
                    className="max-w-[90%] rounded-xl p-4"
                    style={{
                      background: '#0E091C',
                      border:     '1px solid rgba(110,84,255,0.10)',
                    }}
                  >
                    <p
                      className="font-mono text-[10px] tracking-widest text-muted mb-3"
                    >
                      PARSED STRATEGY
                    </p>
                    <JsonView data={JSON_RESPONSE as Record<string, unknown>} />
                  </div>
                </div>
              )}

              {/* Order confirmation */}
              {showAgent && (
                <div className="flex items-center gap-3 mt-auto">
                  <span
                    className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-cyan px-3 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(133,230,255,0.10)',
                      border:     '1px solid rgba(133,230,255,0.20)',
                    }}
                  >
                    ✓ ORDER PLACED
                  </span>
                  <span
                    className="font-mono text-muted"
                    style={{ fontSize: 10, letterSpacing: '1px' }}
                  >
                    TX: {TX_HASH}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right top — Settlement speed */}
          <div
            style={{ ...cardStyle, padding: 32 }}
          >
            <p className="font-mono text-[11px] tracking-widest text-muted mb-2">
              SETTLEMENT SPEED
            </p>
            <div
              className="font-display text-monad-purple mb-6"
              style={{ fontSize: 56, lineHeight: 1 }}
            >
              &lt; 1s
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-3 h-24">
              {SETTLEMENT_BARS.map((bar) => (
                <div key={bar.label} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-full rounded-sm transition-all duration-1000"
                    style={{
                      height:     visible ? `${bar.height}%` : '0%',
                      background: bar.color,
                      minHeight:  4,
                    }}
                  />
                  <span
                    className="font-mono text-muted"
                    style={{ fontSize: 9, letterSpacing: '1px' }}
                  >
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right bottom — Parallel execution */}
          <div
            style={{ ...cardStyle, padding: 32 }}
          >
            <h3 className="font-display text-2xl text-white mb-1">PARALLEL EXECUTION</h3>
            <p className="font-mono text-[11px] tracking-widest text-muted mb-6">
              SIMULTANEOUS SETTLEMENT
            </p>

            <div className="flex flex-col gap-3">
              {EXEC_ROWS.map((row, ri) => (
                <div key={ri} className="flex items-center gap-2">
                  {row.map((active, ci) => (
                    <div
                      key={ci}
                      className="rounded-full transition-all duration-500"
                      style={{
                        width:      active ? 28 : 8,
                        height:     8,
                        background: active
                          ? ci === row.lastIndexOf(1)
                            ? '#85E6FF'
                            : '#6E54FF'
                          : 'rgba(110,84,255,0.15)',
                        transitionDelay: visible ? `${(ri * 4 + ci) * 80}ms` : '0ms',
                      }}
                    />
                  ))}
                  {/* "flowing" dot */}
                  {visible && (
                    <div
                      className="w-2 h-2 rounded-full bg-cyan animate-pulse"
                      style={{ animationDelay: `${ri * 200}ms` }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
