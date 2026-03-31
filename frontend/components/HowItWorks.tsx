'use client'
import { useRef, useEffect, useState } from 'react'
import { MessageSquare, Zap, CheckCircle } from 'lucide-react'

const FEATURES = [
  {
    icon:  MessageSquare,
    name:  'DESCRIBE',
    desc:  'Tell AutoNad your strategy in plain English. Our AI parses intent into precise on-chain parameters instantly.',
    tag:   'AI POWERED',
    index: 0,
  },
  {
    icon:  Zap,
    name:  'EXECUTE',
    desc:  'The agent monitors Chainlink price feeds on Monad and fires your limit orders the moment conditions are met.',
    tag:   'AUTONOMOUS',
    index: 1,
  },
  {
    icon:  CheckCircle,
    name:  'SETTLE',
    desc:  "Orders settle in under one second on Monad's 10,000 TPS parallel execution engine. You're never frontrun.",
    tag:   '10,000 TPS',
    index: 2,
  },
]

export function HowItWorks() {
  const sectionRef  = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

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
      {/* Section intro */}
      <div className="flex flex-col md:flex-row gap-12 md:gap-24 mb-20 max-w-[1280px] mx-auto">
        <div className="flex-1">
          <p className="font-mono text-[11px] tracking-[3px] text-monad-purple mb-4">
            HOW IT WORKS
          </p>
          <h2 className="font-display text-5xl md:text-6xl text-white leading-none">
            From Words to
            <br />
            Blockchain.
          </h2>
        </div>
        <div className="flex-1 flex items-center">
          <p className="font-body text-white/55 text-lg leading-relaxed">
            AutoNad translates your plain-English trading intent into atomic on-chain limit orders — parsed by Claude AI, monitored by our agent, and settled at Monad speed.
          </p>
        </div>
      </div>

      {/* Feature grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 max-w-[1280px] mx-auto"
        style={{ gap: 1, background: 'rgba(110,84,255,0.08)' }}
      >
        {FEATURES.map((feat) => {
          const Icon = feat.icon
          return (
            <div
              key={feat.name}
              className="group relative overflow-hidden p-12 transition-colors duration-300 hover:bg-panel"
              style={{
                background: '#020108',
                transform:  visible ? 'translateY(0)' : 'translateY(32px)',
                opacity:    visible ? 1 : 0,
                transition: `transform 0.7s ease ${feat.index * 150}ms, opacity 0.7s ease ${feat.index * 150}ms, background 300ms ease`,
                '--index':  feat.index,
              } as React.CSSProperties}
            >
              {/* Top-edge shimmer on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, #6E54FF, transparent)',
                }}
              />

              {/* Ghost step number */}
              <span
                className="absolute top-0 right-4 font-display leading-none select-none pointer-events-none"
                style={{
                  fontSize: 120,
                  color: 'rgba(110,84,255,0.04)',
                }}
                aria-hidden
              >
                0{feat.index + 1}
              </span>

              {/* Icon */}
              <Icon size={24} className="text-monad-purple mb-6 relative z-10" />

              {/* Name */}
              <h3 className="font-display text-2xl text-white mb-3 relative z-10">
                {feat.name}
              </h3>

              {/* Description */}
              <p className="font-body text-sm text-white/55 leading-relaxed relative z-10">
                {feat.desc}
              </p>

              {/* Tag badge */}
              <span
                className="font-mono text-[10px] tracking-widest text-monad-purple mt-6 inline-block px-3 py-1 rounded-full relative z-10"
                style={{
                  background: 'rgba(110,84,255,0.10)',
                  border:     '1px solid rgba(110,84,255,0.20)',
                }}
              >
                {feat.tag}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
