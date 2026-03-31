'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Moon, Sun } from 'lucide-react'

function MonadLogomark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Monad logomark"
    >
      <rect
        x="4" y="4"
        width="32" height="32"
        rx="8"
        fill="currentColor"
        transform="rotate(45 20 20)"
      />
      <rect
        x="11" y="11"
        width="18" height="18"
        rx="4"
        fill="none"
        stroke="var(--bg-primary, #0E091C)"
        strokeWidth="2"
        transform="rotate(45 20 20)"
      />
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'DASHBOARD', href: '/dashboard' },
  { label: 'ORDERS',    href: '/orders' },
  { label: 'AGENT',     href: '/agent' },
  { label: 'DOCS',      href: '#' },
]

export function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [theme, setTheme]         = useState<'dark' | 'light'>('dark')
  const shimmerRef                = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('autonад-theme') as 'dark' | 'light' | null
    const initial = stored ?? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('autonад-theme', next)
  }

  return (
    <nav
      style={{
        position:       'fixed',
        top:            0,
        left:           0,
        right:          0,
        zIndex:         1000,
        transition:     'background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease',
        background:     scrolled ? 'rgba(14, 9, 28, 0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom:   scrolled ? '1px solid rgba(110,84,255,0.1)' : '1px solid transparent',
      }}
    >
      <div className="flex items-center justify-between px-8 py-4 max-w-[1440px] mx-auto">

        {/* Left: logo */}
        <Link href="/" className="flex items-center gap-3 text-white" style={{ padding: '4px 0' }}>
          <span style={{ padding: '4px' }}>
            <MonadLogomark size={24} />
          </span>
          <span
            className="font-mono text-sm tracking-[4px] text-white"
            style={{ letterSpacing: '4px' }}
          >
            AUTONАД
          </span>
        </Link>

        {/* Center: nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-mono text-[11px] tracking-widest text-muted hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: theme toggle + CTA */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="text-muted hover:text-white transition-colors p-1"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link
            href="/dashboard"
            className="relative overflow-hidden bg-monad-purple text-white font-mono font-semibold text-[11px] tracking-widest px-6 py-3 rounded-lg group"
          >
            <span className="relative z-10">LAUNCH APP</span>
            {/* Shimmer sweep */}
            <span
              ref={shimmerRef}
              aria-hidden
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
              }}
            />
          </Link>
        </div>
      </div>
    </nav>
  )
}
