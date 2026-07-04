"use client";

import { useEffect, useRef } from "react";

const TRAIL = 5;

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.innerWidth >= 640;
    if (!fine || reduced || !wide) return;

    document.documentElement.setAttribute("data-cursor", "on");
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;
    dot.style.display = "block";
    ring.style.display = "flex";
    trailRefs.current.forEach((t) => t && (t.style.display = "block"));

    let x = -100, y = -100, rx = -100, ry = -100;
    const tx = Array(TRAIL).fill(-100);
    const ty = Array(TRAIL).fill(-100);
    let state: "default" | "link" | "button" | "view" | "label" = "default";
    let mode: string | null = null;
    let raf = 0;

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement;
      const labelled = t.closest("[data-cursor-label]") as HTMLElement | null;
      mode = labelled ? labelled.getAttribute("data-cursor-label") : null;
      if (mode) state = "label";
      else if (t.closest("button, .engage-pill, [role='button']")) state = "button";
      else if (t.closest("canvas, img, [data-cursor-hover]")) state = "view";
      else if (t.closest("a")) state = "link";
      else state = "default";
    };

    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      dot.style.opacity = state === "label" ? "0" : "1";

      /* comet trail: each dot chases the previous */
      let px = x, py = y;
      for (let i = 0; i < TRAIL; i++) {
        tx[i] += (px - tx[i]) * (0.32 - i * 0.045);
        ty[i] += (py - ty[i]) * (0.32 - i * 0.045);
        const el = trailRefs.current[i];
        if (el) el.style.transform = `translate(${tx[i]}px, ${ty[i]}px) translate(-50%, -50%)`;
        px = tx[i];
        py = ty[i];
      }

      const s = state === "label" ? 3.2 : state === "button" ? 2.3 : state === "link" || state === "view" ? 2.1 : 1;
      const rot = state === "button" ? 45 : 0;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%) scale(${s}) rotate(${rot}deg)`;
      ring.style.borderRadius = state === "button" ? "22%" : "9999px";

      if (state === "label") {
        ring.style.borderColor = "rgb(var(--accent-red) / 0.9)";
        ring.style.background = "rgb(var(--accent-red) / 0.92)";
        label.textContent = mode;
        label.style.color = "rgb(255 255 255)";
        label.style.opacity = "1";
        label.style.transform = "rotate(0deg)";
      } else if (state === "button") {
        ring.style.background = "transparent";
        ring.style.borderColor = "rgb(var(--accent-gold) / 0.95)";
        label.textContent = "GO";
        label.style.color = "rgb(var(--accent-gold))";
        label.style.opacity = "1";
        label.style.transform = "rotate(-45deg)";
      } else if (state === "view") {
        ring.style.background = "transparent";
        ring.style.borderColor = "rgb(var(--accent-gold) / 0.75)";
        label.textContent = "+";
        label.style.color = "rgb(var(--accent-gold))";
        label.style.opacity = "0.9";
        label.style.transform = "rotate(0deg)";
      } else {
        ring.style.background = "transparent";
        ring.style.borderColor =
          state === "link" ? "rgb(var(--accent-gold) / 0.9)" : "rgb(var(--accent-gold) / 0.45)";
        label.style.opacity = "0";
      }
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
      {Array.from({ length: TRAIL }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          aria-hidden="true"
          className="cursor-trail"
          style={{
            width: `${5 - i * 0.8}px`,
            height: `${5 - i * 0.8}px`,
            opacity: [0.3, 0.2, 0.12, 0.07, 0.04][i],
          }}
        />
      ))}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-1.5 w-1.5 rounded-full bg-gold"
        style={{ boxShadow: "0 0 8px rgb(var(--accent-gold) / 0.7)" }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-9 w-9 items-center justify-center border transition-[border-color,background,border-radius] duration-300"
        style={{ borderColor: "rgb(var(--accent-gold) / 0.45)", borderRadius: "9999px" }}
      >
        <span
          ref={labelRef}
          className="font-mono text-[7px] font-medium uppercase tracking-[0.14em] text-white"
          style={{ opacity: 0, transition: "opacity 0.25s ease" }}
        />
      </div>
    </>
  );
}
