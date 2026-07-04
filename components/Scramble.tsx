"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/providers/Providers";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—/";

export default function Scramble({
  text,
  className,
  duration = 900,
}: {
  text: string;
  className?: string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(text);
  const ran = useRef(false);

  useEffect(() => {
    if (reduce || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || ran.current) return;
        ran.current = true;
        io.disconnect();
        const t0 = performance.now();
        let raf = 0;
        const tick = (now: number) => {
          const p = Math.min((now - t0) / duration, 1);
          const settled = Math.floor(p * text.length);
          let out = text.slice(0, settled);
          for (let i = settled; i < text.length; i++) {
            out += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
          setDisplay(out);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text, duration, reduce]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {display}
    </span>
  );
}
