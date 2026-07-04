"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/components/providers/Providers";

export default function KineticWord({ word = "RENAISSANCE" }: { word?: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["18%", "-68%"]);

  return (
    <section
      ref={ref}
      className="hairline-t hairline-b relative overflow-hidden py-[13vh]"
      aria-label={word}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute -left-[10%] top-1/2 h-[420px] w-[62%] -translate-y-1/2 rounded-full opacity-[0.14] blur-3xl"
          style={{ background: "radial-gradient(ellipse, rgb(var(--accent-gold)) 0%, transparent 65%)" }}
        />
        <div
          className="absolute -right-[8%] top-1/2 h-[360px] w-[48%] -translate-y-1/2 rounded-full opacity-[0.10] blur-3xl"
          style={{ background: "radial-gradient(ellipse, rgb(var(--accent-red)) 0%, transparent 65%)" }}
        />
      </div>

      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { x }}
        className="relative whitespace-nowrap font-display text-[clamp(110px,22vw,320px)] font-black uppercase leading-[0.9] tracking-[-0.02em] text-ink"
      >
        {word}
        <span className="text-stroke-gold ml-[0.35em]">{word}</span>
      </motion.div>
    </section>
  );
}
