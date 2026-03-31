'use client'
import { useEffect, useRef } from 'react'

export function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only on pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) return

    let mx = -100, my = -100
    let rx = -100, ry = -100
    let rafId: number
    let hovering = false

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY

      if (dotRef.current) {
        dotRef.current.style.left = `${mx}px`
        dotRef.current.style.top  = `${my}px`
      }

      const target = e.target as Element
      const isHoverable = !!target.closest(
        'a, button, [role="button"], input, select, textarea, label, [data-cursor-hover]'
      )

      if (isHoverable && !hovering) {
        hovering = true
        if (dotRef.current) {
          dotRef.current.style.transform = 'translate(-50%, -50%) scale(0)'
        }
        if (ringRef.current) {
          ringRef.current.style.transform = 'translate(-50%, -50%) scale(2.5)'
          ringRef.current.style.background = 'rgba(110, 84, 255, 0.2)'
          ringRef.current.style.borderColor = 'rgba(110, 84, 255, 0.8)'
        }
      } else if (!isHoverable && hovering) {
        hovering = false
        if (dotRef.current) {
          dotRef.current.style.transform = 'translate(-50%, -50%) scale(1)'
        }
        if (ringRef.current) {
          ringRef.current.style.transform = 'translate(-50%, -50%) scale(1)'
          ringRef.current.style.background = 'transparent'
          ringRef.current.style.borderColor = 'rgba(110, 84, 255, 0.6)'
        }
      }
    }

    const loop = () => {
      rx += (mx - rx) * 0.10
      ry += (my - ry) * 0.10

      if (ringRef.current) {
        ringRef.current.style.left = `${rx}px`
        ringRef.current.style.top  = `${ry}px`
      }

      rafId = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMouseMove)
    rafId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        style={{
          position:        'fixed',
          width:           10,
          height:          10,
          borderRadius:    '50%',
          background:      '#6E54FF',
          pointerEvents:   'none',
          zIndex:          9999,
          transform:       'translate(-50%, -50%)',
          mixBlendMode:    'difference',
          transition:      'transform 150ms ease',
          left:            -100,
          top:             -100,
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        style={{
          position:        'fixed',
          width:           44,
          height:          44,
          borderRadius:    '50%',
          border:          '1px solid rgba(110, 84, 255, 0.6)',
          background:      'transparent',
          pointerEvents:   'none',
          zIndex:          9999,
          transform:       'translate(-50%, -50%)',
          mixBlendMode:    'difference',
          transition:      'transform 200ms ease, background 200ms ease, border-color 200ms ease',
          left:            -100,
          top:             -100,
        }}
      />
    </>
  )
}
