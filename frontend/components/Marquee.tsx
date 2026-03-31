const WORDS = [
  { text: 'AUTONАД',       filled: true  },
  { text: 'LIMIT ORDERS',  filled: false },
  { text: 'MONAD',         filled: true  },
  { text: 'AI AGENT',      filled: false },
  { text: '10K TPS',       filled: true  },
  { text: 'NON-CUSTODIAL', filled: false },
]

function Diamond() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ color: 'rgba(110,84,255,0.40)', flexShrink: 0 }}
    >
      <rect
        x="5" y="5"
        width="30" height="30"
        rx="7"
        fill="currentColor"
        transform="rotate(45 20 20)"
      />
    </svg>
  )
}

export function Marquee() {
  return (
    <div
      className="overflow-hidden py-14"
      style={{
        borderTop:    '1px solid rgba(110,84,255,0.1)',
        borderBottom: '1px solid rgba(110,84,255,0.1)',
        background:   '#020108',
      }}
    >
      {/* Duplicate array for seamless loop */}
      <div className="flex items-center animate-marquee whitespace-nowrap">
        {[0, 1].map((pass) => (
          <div key={pass} className="flex items-center">
            {WORDS.map((word, i) => (
              <span key={i} className="flex items-center gap-6 mx-6">
                <span
                  className="font-display tracking-widest select-none"
                  style={{
                    fontSize: 60,
                    color:              word.filled ? '#6E54FF' : 'transparent',
                    WebkitTextStroke:   word.filled ? undefined : '1px rgba(110,84,255,0.25)',
                  }}
                >
                  {word.text}
                </span>
                <Diamond />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
