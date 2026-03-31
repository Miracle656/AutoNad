'use client'
import { useRef, useEffect, useState } from 'react'

type Phase = {
  tag:    string
  title:  string
  desc:   string
  date:   string
  status: 'complete' | 'active' | 'upcoming'
}

const PHASES: Phase[] = [
  {
    tag:    'PHASE 01',
    title:  'Foundation',
    desc:   'Smart contracts deployed. Agent architecture complete. Monad testnet integration live.',
    date:   'Q1 2026 ✓',
    status: 'complete',
  },
  {
    tag:    'PHASE 02',
    title:  'Intelligence',
    desc:   'Claude AI strategy parsing. Real-time Chainlink price monitoring. WebSocket live feeds.',
    date:   'Q2 2026 ←',
    status: 'active',
  },
  {
    tag:    'PHASE 03',
    title:  'Expansion',
    desc:   'Multi-token support. Advanced DCA strategies. Portfolio rebalancing engine.',
    date:   'Q3 2026',
    status: 'upcoming',
  },
  {
    tag:    'PHASE 04',
    title:  'Mainnet',
    desc:   'Monad mainnet deployment. Full production launch. DAO governance integration.',
    date:   'Q4 2026',
    status: 'upcoming',
  },
]

const DOT_STYLES: Record<Phase['status'], React.CSSProperties> = {
  complete: {
    background:  '#6E54FF',
    border:      '2px solid #6E54FF',
    boxShadow:   '0 0 12px rgba(110,84,255,0.5)',
  },
  active: {
    background:  '#020108',
    border:      '2px solid #6E54FF',
    animation:   'pulse-purple 2s ease-in-out infinite',
  },
  upcoming: {
    background:  '#020108',
    border:      '2px solid rgba(74,69,102,0.40)',
  },
}

export function Roadmap() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-32 px-8 md:px-16"
      style={{ background: '#020108' }}
    >
      <div className="max-w-[1280px] mx-auto">
        <p className="font-mono text-[11px] tracking-[3px] text-monad-purple mb-4">ROADMAP</p>
        <h2 className="font-display text-5xl text-white mb-20 leading-none">The Path Forward.</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Horizontal connector line (desktop only) */}
          <div
            className="hidden md:block absolute top-5 left-0 right-0 h-[1px]"
            style={{
              background: 'linear-gradient(90deg, #6E54FF, #85E6FF, #FF8EE4, rgba(255,255,255,0.10))',
            }}
          />

          {PHASES.map((phase, i) => (
            <div
              key={phase.tag}
              className="relative"
              style={{
                transform:  visible ? 'translateY(0)' : 'translateY(24px)',
                opacity:    visible ? 1 : 0,
                transition: `transform 0.6s ease ${i * 120}ms, opacity 0.6s ease ${i * 120}ms`,
              }}
            >
              {/* Dot */}
              <div
                className="relative z-10 w-[42px] h-[42px] rounded-full flex items-center justify-center mb-6"
                style={DOT_STYLES[phase.status]}
              >
                {phase.status === 'complete' && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Phase label */}
              <p className="font-mono text-[10px] tracking-[3px] text-monad-purple mb-2">
                {phase.tag}
              </p>

              {/* Title */}
              <h3 className="font-display text-2xl text-white mb-2">{phase.title}</h3>

              {/* Description */}
              <p className="font-body text-sm text-white/45 leading-relaxed mb-3">
                {phase.desc}
              </p>

              {/* Date chip */}
              <span
                className="font-mono text-muted inline-block px-3 py-1 rounded-full"
                style={{
                  fontSize:   9,
                  letterSpacing: '3px',
                  background: 'rgba(255,255,255,0.05)',
                  border:     '1px solid rgba(255,255,255,0.10)',
                }}
              >
                {phase.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
