"use client";

import { useEffect, useRef, useState } from "react";

const DURATION = 2100;

export default function Preloader() {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"loading" | "lift" | "done">("loading");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("satori-preloaded");
    if (reduced || seen) {
      setPhase("done");
      document.documentElement.setAttribute("data-loaded", "true");
      return;
    }

    document.documentElement.setAttribute("data-loaded", "false");
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase("lift");
        sessionStorage.setItem("satori-preloaded", "1");
        setTimeout(() => {
          setPhase("done");
          document.documentElement.setAttribute("data-loaded", "true");
          window.dispatchEvent(new Event("satori:loaded"));
        }, 950);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (phase === "done") return null;

  const R = 54;
  const C = 2 * Math.PI * R;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-bg"
      style={{
        transform: phase === "lift" ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 0.9s cubic-bezier(0.76, 0, 0.24, 1)",
      }}
    >
      <div
        className="relative flex flex-col items-center gap-8"
        style={{
          opacity: phase === "lift" ? 0 : 1,
          transition: "opacity 0.35s ease",
        }}
      >
        {/* enso ring draw */}
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle
            cx="64" cy="64" r={R} fill="none"
            stroke="rgb(var(--text-muted) / 0.25)" strokeWidth="1"
          />
          <circle
            cx="64" cy="64" r={R} fill="none"
            stroke="rgb(var(--accent-gold))" strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - count / 100)}
            transform="rotate(-90 64 64)"
          />
          {/* crimson spark at the drawing tip */}
          <circle
            cx={64 + R * Math.cos(((count / 100) * 360 - 90) * (Math.PI / 180))}
            cy={64 + R * Math.sin(((count / 100) * 360 - 90) * (Math.PI / 180))}
            r="2.5"
            fill="rgb(var(--accent-red))"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center pb-[72px]">
          <span className="font-display text-[26px] font-bold tabular-nums tracking-[0.02em] text-ink">
            {String(count).padStart(3, "0")}
          </span>
        </div>

        <p className="font-display text-[11px] font-semibold uppercase tracking-[0.42em] text-ink-2">
          Satori<span className="text-crimson">.</span>Ventures
        </p>
      </div>
    </div>
  );
}
