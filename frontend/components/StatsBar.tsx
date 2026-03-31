'use client'
import { useRef, useEffect, useState } from 'react'

type StatItem = {
  value: string
  numeric: number
  suffix: string
  prefix?: string
  label: string
  delay: number
}

const STATS: StatItem[] = [
  { value: '1,247+', numeric: 1247, suffix: '+',   prefix: '',  label: 'ORDERS EXECUTED', delay: 0 },
  { value: '99.9%',  numeric: 999,  suffix: '%',   prefix: '',  label: 'AGENT UPTIME',    delay: 150 },
  { value: '< 1s',   numeric: 0,    suffix: '',    prefix: '',  label: 'AVG SETTLEMENT',  delay: 300 },
  { value: '$0.001', numeric: 0,    suffix: '',    prefix: '',  label: 'AVG GAS FEE',     delay: 450 },
]

function StatCell({
  stat,
  triggered,
}: {
  stat: StatItem
  triggered: boolean
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!triggered || stat.numeric === 0) return

    const duration = 1800
    const start = performance.now()
    const target = stat.numeric

    const tick = (now: number) => {
      const elapsed  = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [triggered, stat.numeric])

  const displayValue =
    stat.numeric === 0
      ? stat.value
      : stat.label === 'AGENT UPTIME'
      ? `${(count / 10).toFixed(1)}%`
      : `${count.toLocaleString()}${stat.suffix}`

  return (
    <div
      className="relative overflow-hidden bg-surface p-8"
      style={{ '--delay': `${stat.delay}ms` } as React.CSSProperties}
    >
      {/* Faint radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top left, rgba(110,84,255,0.03) 0%, transparent 70%)',
        }}
      />

      {/* Left-edge purple bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] bg-monad-purple origin-top transition-transform duration-700"
        style={{
          transitionDelay: `var(--delay)`,
          transform: triggered ? 'scaleY(1)' : 'scaleY(0)',
        }}
      />

      {/* Number */}
      <div
        className="relative font-display text-5xl text-monad-purple mb-3 tabular-nums"
        style={{ letterSpacing: '-0.02em' }}
      >
        {displayValue}
      </div>

      {/* Label */}
      <div className="font-mono text-[11px] tracking-widest text-muted">
        {stat.label}
      </div>
    </div>
  )
}

export function StatsBar() {
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
    <div
      ref={sectionRef}
      className="grid grid-cols-2 md:grid-cols-4"
      style={{
        gap: 1,
        background: 'rgba(110,84,255,0.08)',
      }}
    >
      {STATS.map((stat) => (
        <StatCell key={stat.label} stat={stat} triggered={triggered} />
      ))}
    </div>
  )
}
