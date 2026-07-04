"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/providers/Providers";

export default function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const el = ref.current;
    if (!fine || !el) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight * 0.4;
    let gx = x;
    let gy = y;
    let raf = 0;

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    const loop = () => {
      gx += (x - gx) * 0.1;
      gy += (y - gy) * 0.1;
      el.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-[1] hidden h-[440px] w-[440px] rounded-full opacity-30 md:block"
      style={{
        background:
          "radial-gradient(circle, rgb(var(--accent-gold) / 0.35) 0%, rgb(var(--accent-red) / 0.08) 45%, transparent 70%)",
        filter: "blur(10px)",
      }}
    />
  );
}
