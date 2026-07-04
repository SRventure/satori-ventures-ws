"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/providers/Providers";

/* scroll-velocity-reactive outlined serif marquee (kinetic type wall) */
export default function Marquee({
  items,
  className = "",
  baseSpeed = 60,
}: {
  items: string[];
  className?: string;
  baseSpeed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !trackRef.current) return;
    const track = trackRef.current;
    let x = 0;
    let lastScroll = window.scrollY;
    let vel = 0;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const sy = window.scrollY;
      const target = Math.min(Math.abs(sy - lastScroll) / dt / 900, 4);
      lastScroll = sy;
      vel += (target - vel) * 0.08;
      x -= baseSpeed * (1 + vel * 1.6) * dt;
      const half = track.scrollWidth / 2;
      if (half > 0 && -x >= half) x += half;
      track.style.transform = `translate3d(${x}px,0,0) skewX(${-vel * 1.8}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, baseSpeed]);

  const row = (key: string) => (
    <div key={key} aria-hidden={key === "b"} className="flex shrink-0 items-center">
      {items.map((it, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="text-stroke-gold px-6 font-display text-[11vw] font-black uppercase leading-[1.1] tracking-[-0.01em] md:text-[110px]">
            {it}
          </span>
          <span className="mx-2 inline-block h-2.5 w-2.5 rounded-full bg-crimson" />
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`relative overflow-hidden py-6 select-none ${className}`}
      aria-label={items.join(" · ")}
      role="marquee"
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
