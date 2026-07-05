"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/providers/Providers";

export default function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    let x = window.innerWidth / 2;
    let y = window.innerHeight * 0.4;
    let gx = x;
    let gy = y;
    let lastInput = 0;
    let raf = 0;

    const setFrom = (cx: number, cy: number) => {
      x = cx;
      y = cy;
      lastInput = performance.now();
    };
    const onPointer = (e: PointerEvent) => setFrom(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setFrom(t.clientX, t.clientY);
    };
    const loop = () => {
      // touch devices: idle finger -> glow orbits the hero slowly on its own
      if (coarse && performance.now() - lastInput > 2500) {
        const t = performance.now() / 1000;
        x = window.innerWidth * (0.5 + Math.sin(t * 0.45) * 0.26);
        y = window.innerHeight * (0.38 + Math.sin(t * 0.31 + 1.2) * 0.16);
      }
      gx += (x - gx) * 0.1;
      gy += (y - gy) * 0.1;
      el.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchmove", onTouch);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-[1] h-[300px] w-[300px] rounded-full opacity-30 md:h-[440px] md:w-[440px]"
      style={{
        background:
          "radial-gradient(circle, rgb(var(--accent-gold) / 0.35) 0%, rgb(var(--accent-red) / 0.08) 45%, transparent 70%)",
        filter: "blur(10px)",
      }}
    />
  );
}
