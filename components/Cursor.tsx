"use client";

import { useEffect, useRef } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.innerWidth >= 640;
    if (!fine || reduced || !wide) return;

    document.documentElement.setAttribute("data-cursor", "on");
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    dot.style.display = "block";
    ring.style.display = "block";

    let x = -100, y = -100, rx = -100, ry = -100;
    let hovering = false;
    let raf = 0;

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement;
      hovering = !!t.closest("a, button, [data-cursor-hover]");
    };

    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      const s = hovering ? 2.1 : 1;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%) scale(${s})`;
      ring.style.borderColor = hovering
        ? "rgb(var(--accent-gold) / 0.9)"
        : "rgb(var(--accent-gold) / 0.45)";
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
      document.documentElement.removeAttribute("data-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-1.5 w-1.5 rounded-full bg-gold"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-9 w-9 rounded-full border transition-[border-color] duration-300"
        style={{ borderColor: "rgb(var(--accent-gold) / 0.45)" }}
      />
    </>
  );
}
