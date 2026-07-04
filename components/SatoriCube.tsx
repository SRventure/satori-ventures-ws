"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useReducedMotion, useTheme } from "@/components/providers/Providers";

const CubeCanvas = dynamic(() => import("./SatoriCubeScene"), { ssr: false });

export const CUBE_LAYERS = [
  { name: "Frontier AI", note: "Models, agents, compute" },
  { name: "Web3 Rails", note: "Chains, rollups, protocols" },
  { name: "Open Economies", note: "Ownership, markets, incentives" },
  { name: "The Renaissance", note: "The builders underneath it all" },
];

function LayerLabel({
  progress,
  index,
  side,
  top,
}: {
  progress: MotionValue<number>;
  index: number;
  side: "left" | "right";
  top: string;
}) {
  const t0 = 0.32 + index * 0.05;
  const opacity = useTransform(progress, [t0, t0 + 0.08, 0.7, 0.8], [0, 1, 1, 0]);
  const x = useTransform(progress, [t0, t0 + 0.08], side === "left" ? [-28, 0] : [28, 0]);
  const line = useTransform(progress, [t0 + 0.04, t0 + 0.14], [0, 1]);
  const layer = CUBE_LAYERS[index];

  return (
    <motion.div
      style={{ opacity, x, top }}
      className={`absolute z-[3] w-[150px] md:w-[240px] ${
        side === "left" ? "left-[4%] text-left md:left-[6%]" : "right-[4%] text-right md:right-[6%]"
      }`}
    >
      <p className="font-display text-[14px] font-black uppercase tracking-[0.04em] text-ink md:text-[24px]">
        {layer.name}
      </p>
      <motion.span
        style={{ scaleX: line }}
        className={`mt-1 block h-[2px] w-full bg-gold ${
          side === "left" ? "origin-left" : "origin-right"
        }`}
      />
      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-2 md:text-[10px] md:tracking-[0.18em]">
        {layer.note}
      </p>
      {/* dashed connector toward center */}
      <motion.span
        style={{ scaleX: line }}
        aria-hidden="true"
        className={`absolute top-[14px] hidden h-px w-[9vw] border-t border-dashed border-gold/50 lg:block ${
          side === "left" ? "left-full ml-4 origin-left" : "right-full mr-4 origin-right"
        }`}
      />
    </motion.div>
  );
}

export default function SatoriCube() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { theme } = useTheme();
  const [webgl, setWebgl] = useState(false);
  const near = useInView(ref, { margin: "600px 0px 600px 0px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const progRef = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progRef.current = v;
  });

  useEffect(() => {
    setWebgl(!reduce);
  }, [reduce]);

  const headOpacity = useTransform(scrollYProgress, [0.02, 0.1, 0.26, 0.34], [0, 1, 1, 0]);
  const headY = useTransform(scrollYProgress, [0.02, 0.1], [24, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0.04, 0.14], [1, 0]);
  const logoOpacity = useTransform(scrollYProgress, [0.86, 0.97], [0, 1]);
  const logoScale = useTransform(scrollYProgress, [0.86, 0.98], [0.7, 1]);

  const labels = useMemo(
    () =>
      [
        { side: "left" as const, top: "16%" },
        { side: "right" as const, top: "34%" },
        { side: "left" as const, top: "56%" },
        { side: "right" as const, top: "74%" },
      ].map((pos, i) => ({ ...pos, index: i })),
    []
  );

  /* NOTE: the section (and its ref) must render on the very first pass —
     an early-return fallback leaves useScroll/useInView bound to a null ref
     and the pinned animations never receive scroll progress. */
  if (!webgl) {
    return (
      <section
        ref={ref}
        className="hairline-t relative px-6 py-24 md:px-10"
        aria-label="The Satori thesis"
      >
        <p className="eyebrow eyebrow-tick mb-7">00 / Thesis architecture</p>
        <h2 className="display-lg text-[clamp(34px,6.4vw,64px)]">
          ONE CONVICTION.
          <br />
          <span className="text-gold">FOUR LAYERS.</span>
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {CUBE_LAYERS.map((l, i) => (
            <div key={l.name} className="glass-card p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-crimson">
                Layer 0{i + 1}
              </p>
              <p className="mt-2 font-display text-[21px] font-black uppercase text-ink">
                {l.name}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-2">
                {l.note}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="hairline-t relative h-[400svh]"
      aria-label="The Satori thesis — one conviction, four layers"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {near && (
          <div className="absolute inset-0" aria-hidden="true">
            <CubeCanvas progress={progRef} dark={theme === "dark"} />
          </div>
        )}

        {/* phase 1: heading */}
        <motion.div
          style={{ opacity: headOpacity, y: headY }}
          className="absolute inset-x-0 top-[14vh] z-[3] text-center"
        >
          <p className="eyebrow eyebrow-tick mb-5 inline-block">00 / Thesis architecture</p>
          <h2 className="display-lg text-[clamp(34px,5.8vw,72px)]">
            ONE CONVICTION. <span className="text-gold">FOUR LAYERS.</span>
          </h2>
        </motion.div>

        {/* phase 2: layer labels */}
        {labels.map((l) => (
          <LayerLabel
            key={l.index}
            progress={scrollYProgress}
            index={l.index}
            side={l.side}
            top={l.top}
          />
        ))}

        {/* phase 3: cube resolves into the mark */}
        <motion.div
          style={{ opacity: logoOpacity, scale: logoScale }}
          className="absolute inset-0 z-[3] flex flex-col items-center justify-center"
        >
          <Image src="/satorl_logo.png" alt="" width={72} height={84} className="company-logo" />
          <p className="mt-6 font-display text-[28px] font-black uppercase tracking-[0.1em] text-ink">
            Satori<span className="text-crimson">.</span>Ventures
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.26em] text-ink-2">
            Thesis assembled // Online
          </p>
        </motion.div>

        {/* scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          aria-hidden="true"
          className="absolute bottom-7 left-1/2 z-[3] -translate-x-1/2"
        >
          <span className="scroll-continue">
            <ChevronDown className="chevron-pulse h-4 w-4 text-gold" />
            Explore
          </span>
        </motion.div>
      </div>
    </section>
  );
}
