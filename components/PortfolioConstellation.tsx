"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Company } from "@/lib/companies";
import { useReducedMotion, useTheme } from "@/components/providers/Providers";

const Scene = dynamic(() => import("./ConstellationScene"), { ssr: false });

const LEGEND = [
  { label: "Frontier AI", cls: "bg-gold" },
  { label: "Web3 Rails", cls: "bg-crimson" },
  { label: "Open Economies", cls: "bg-ink-2" },
];

export default function PortfolioConstellation() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { theme } = useTheme();
  const [webgl, setWebgl] = useState(false);
  const [hovered, setHovered] = useState<Company | null>(null);
  const near = useInView(ref, { margin: "500px 0px 500px 0px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const progRef = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progRef.current = v;
  });

  useEffect(() => {
    setWebgl(!reduce);
  }, [reduce]);

  /* section + ref must render on the very first pass (useScroll null-ref rule) */
  if (!webgl) return <section ref={ref} aria-hidden="true" />;

  return (
    <section
      ref={ref}
      className="hairline-t relative h-[92svh] overflow-hidden"
      aria-label="Portfolio constellation — the Satori system"
    >
      {near && (
        <div className="absolute inset-0">
          <Scene progress={progRef} dark={theme === "dark"} onHover={setHovered} />
        </div>
      )}

      {/* header */}
      <div className="pointer-events-none absolute left-6 top-14 z-[3] md:left-10">
        <p className="eyebrow eyebrow-tick mb-5">02.5 / The system</p>
        <h2 className="display-lg text-[clamp(30px,4.2vw,52px)]">
          ORBITING ONE
          <br />
          <span className="text-gold">CONVICTION.</span>
        </h2>
        <p className="mt-4 max-w-[300px] font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-ink-2">
          27 positions in orbit — touch a node, tap to visit
        </p>
      </div>

      {/* sector legend */}
      <div className="pointer-events-none absolute bottom-10 left-6 z-[3] flex flex-col gap-2 md:left-10">
        {LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">
            <span className={`inline-block h-[6px] w-[6px] rounded-full ${l.cls}`} />
            {l.label}
          </span>
        ))}
      </div>

      {/* hover company card */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key={hovered.name}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card pointer-events-none absolute right-4 top-1/2 z-[3] w-[260px] -translate-y-1/2 p-5 md:right-10 md:w-[300px] md:p-6"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-crimson">
              {hovered.category}
            </p>
            <p className="mt-2 flex items-center gap-2 font-display text-[22px] font-black uppercase leading-tight text-ink">
              {hovered.name}
              <ArrowUpRight className="h-4 w-4 shrink-0 text-gold" />
            </p>
            <p className="mt-3 font-sans text-[13px] leading-relaxed text-ink-2">
              {hovered.description}
            </p>
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.24em] text-ink-2">
              Status // <span className="text-gold">Active position</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
