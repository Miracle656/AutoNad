"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Hide on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    // Show cursors
    cursor.style.opacity = "1";
    dot.style.opacity = "1";

    let mx = 0, my = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      // Dot follows instantly
      gsap.set(dot, { x: mx, y: my });
      // Ring follows with lag
      gsap.to(cursor, { x: mx, y: my, duration: 0.35, ease: "power2.out" });
    };

    const onEnterHoverable = () => {
      gsap.to(cursor, { scale: 2, duration: 0.25, ease: "power2.out" });
      gsap.to(dot, { scale: 0, duration: 0.2 });
    };

    const onLeaveHoverable = () => {
      gsap.to(cursor, { scale: 1, duration: 0.3, ease: "power3.out" });
      gsap.to(dot, { scale: 1, duration: 0.2 });
    };

    const onEnterCanvas = () => {
      gsap.to(cursor, { borderColor: "rgba(133,230,255,0.6)", duration: 0.2 });
    };
    const onLeaveCanvas = () => {
      gsap.to(cursor, { borderColor: "rgba(255,255,255,0.5)", duration: 0.2 });
    };

    document.addEventListener("mousemove", onMove);

    const attachListeners = () => {
      document.querySelectorAll("a, button, [role='button'], [data-cursor='hover']")
        .forEach((el) => {
          el.addEventListener("mouseenter", onEnterHoverable);
          el.addEventListener("mouseleave", onLeaveHoverable);
        });
      document.querySelectorAll("canvas")
        .forEach((el) => {
          el.addEventListener("mouseenter", onEnterCanvas);
          el.addEventListener("mouseleave", onLeaveCanvas);
        });
    };
    attachListeners();

    // MutationObserver to handle dynamically added elements
    const obs = new MutationObserver(attachListeners);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      obs.disconnect();
    };
  }, []);

  return (
    <>
      {/* Outer ring */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.5)",
          opacity: 0,
          mixBlendMode: "difference",
        }}
      />
      {/* Inner dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "white",
          opacity: 0,
          mixBlendMode: "difference",
        }}
      />
    </>
  );
}
