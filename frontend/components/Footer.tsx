import Link from 'next/link'

function MonadLogomark({ size = 20 }: { size?: number }) {
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
        stroke="#020108"
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
  { label: 'GITHUB',    href: '#' },
]

export function Footer() {
  return (
    <footer
      className="px-8 md:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-6"
      style={{
        background:  '#020108',
        borderTop:   '1px solid rgba(110,84,255,0.08)',
      }}
    >
      {/* Left: logo + wordmark */}
      <Link href="/" className="flex items-center gap-3 text-white" style={{ padding: '4px 0' }}>
        <span style={{ padding: '4px' }}>
          <MonadLogomark size={20} />
        </span>
        <span
          className="font-mono text-sm text-white"
          style={{ letterSpacing: '4px' }}
        >
          AUTONАД
        </span>
      </Link>

      {/* Center: nav links */}
      <div className="flex items-center gap-6 md:gap-8 flex-wrap justify-center">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="font-mono text-[11px] tracking-widest text-muted hover:text-monad-purple transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right: copyright */}
      <p
        className="font-mono text-muted"
        style={{ fontSize: 10, letterSpacing: '3px' }}
      >
        © 2026 AUTONАД · MONAD TESTNET
      </p>
    </footer>
  )
}
