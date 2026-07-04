"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useReducedMotion } from "@/components/providers/Providers";

export const CUBE_LAYERS = [
  { name: "Frontier AI", note: "Models, agents, compute" },
  { name: "Web3 Rails", note: "Chains, rollups, protocols" },
  { name: "Open Economies", note: "Ownership, markets, incentives" },
  { name: "The Renaissance", note: "The builders underneath it all" },
];

/* photoreal AIDC renders (nano-banana-pro), isolated on black — the stage is a
   dark cinematic window in BOTH themes, so overlay colors are hardcoded */
const STACK = [
  { img: "/aidc/l4_core.webp", asm: 34, exp: 17, w: "min(58vw,400px)" },
  { img: "/aidc/l3_fiber.webp", asm: 46, exp: 38, w: "min(72vw,560px)" },
  { img: "/aidc/l2_racks.webp", asm: 58, exp: 58, w: "min(72vw,560px)" },
  { img: "/aidc/l1_cooling.webp", asm: 70, exp: 79, w: "min(76vw,600px)" },
];

const INK = "#F4EFE6";
const INK2 = "#93909b";
const GOLD = "#E2B84C";

function ss(a: number, b: number, x: number) {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

/* explode envelope: assemble → burst apart → re-assemble before the logo resolve */
function env(p: number) {
  return ss(0.3, 0.52, p) * (1 - ss(0.7, 0.85, p));
}

function Layer({
  progress,
  index,
  float,
}: {
  progress: MotionValue<number>;
  index: number;
  float: boolean;
}) {
  const cfg = STACK[index];
  const top = useTransform(progress, (p) => `${cfg.asm + (cfg.exp - cfg.asm) * env(p)}%`);
  const opacity = useTransform(progress, (p) => ss(0.02, 0.09, p) * (1 - ss(0.86, 0.96, p)));
  const scale = useTransform(progress, (p) => 1 + env(p) * 0.05 - ss(0.86, 0.97, p) * 0.3);

  return (
    <motion.div
      style={{ top, opacity, scale, x: "-50%", y: "-50%" }}
      className="absolute left-1/2"
    >
      <motion.div
        animate={float ? { y: [0, -7, 0] } : undefined}
        transition={{ duration: 5 + index * 0.9, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src={cfg.img}
          alt=""
          width={1376}
          height={768}
          sizes="(max-width: 768px) 76vw, 600px"
          className="mix-blend-screen"
          style={{ width: cfg.w, height: "auto" }}
        />
      </motion.div>
    </motion.div>
  );
}

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
      <p
        className="font-display text-[14px] font-black uppercase tracking-[0.04em] md:text-[24px]"
        style={{ color: INK }}
      >
        {layer.name}
      </p>
      <motion.span
        style={{ scaleX: line, backgroundColor: GOLD }}
        className={`mt-1 block h-[2px] w-full ${
          side === "left" ? "origin-left" : "origin-right"
        }`}
      />
      <p
        className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] md:text-[10px] md:tracking-[0.18em]"
        style={{ color: INK2 }}
      >
        {layer.note}
      </p>
      {/* dashed connector toward center */}
      <motion.span
        style={{ scaleX: line, borderColor: "rgba(226, 184, 76, 0.5)" }}
        aria-hidden="true"
        className={`absolute top-[14px] hidden h-px w-[9vw] border-t border-dashed lg:block ${
          side === "left" ? "left-full ml-4 origin-left" : "right-full mr-4 origin-right"
        }`}
      />
    </motion.div>
  );
}

export default function SatoriCube() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [motionOn, setMotionOn] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    setMotionOn(!reduce);
  }, [reduce]);

  const headOpacity = useTransform(scrollYProgress, [0.02, 0.1, 0.26, 0.34], [0, 1, 1, 0]);
  const headY = useTransform(scrollYProgress, [0.02, 0.1], [24, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0.04, 0.14], [1, 0]);
  const glowOpacity = useTransform(scrollYProgress, (p) => 0.35 + env(p) * 0.45 - ss(0.86, 0.96, p) * 0.6);
  const logoOpacity = useTransform(scrollYProgress, [0.86, 0.97], [0, 1]);
  const logoScale = useTransform(scrollYProgress, [0.86, 0.98], [0.7, 1]);

  /* NOTE: the section (and its ref) must render on the very first pass —
     an early-return fallback leaves useScroll bound to a null ref
     and the pinned animations never receive scroll progress. */
  if (!motionOn) {
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
      <div
        className="sticky top-0 isolate h-[100svh] overflow-hidden"
        style={{ backgroundColor: "#050508" }}
      >
        {/* stage atmosphere */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: glowOpacity,
            background:
              "radial-gradient(ellipse 60% 45% at 50% 55%, rgba(43, 170, 180, 0.14) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 50% 30%, rgba(226, 150, 60, 0.08) 0%, transparent 65%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background:
              "repeating-linear-gradient(to right, rgba(226,184,76,0.05) 0 1px, transparent 1px 72px), repeating-linear-gradient(to bottom, rgba(226,184,76,0.05) 0 1px, transparent 1px 72px)",
          }}
        />

        {/* the AIDC stack */}
        {STACK.map((_, i) => (
          <Layer key={i} progress={scrollYProgress} index={i} float={motionOn} />
        ))}

        {/* phase 1: heading */}
        <motion.div
          style={{ opacity: headOpacity, y: headY }}
          className="absolute inset-x-0 top-[12vh] z-[3] text-center"
        >
          <p
            className="mb-5 inline-block font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: INK2 }}
          >
            <span style={{ color: "#D61F33" }}>—</span> 00 / Thesis architecture
          </p>
          <h2
            className="display-lg text-[clamp(34px,5.8vw,72px)]"
            style={{ color: INK }}
          >
            ONE CONVICTION. <span style={{ color: GOLD }}>FOUR LAYERS.</span>
          </h2>
        </motion.div>

        {/* phase 2: layer labels */}
        {[
          { side: "left" as const, top: "16%" },
          { side: "right" as const, top: "34%" },
          { side: "left" as const, top: "56%" },
          { side: "right" as const, top: "74%" },
        ].map((l, i) => (
          <LayerLabel key={i} progress={scrollYProgress} index={i} side={l.side} top={l.top} />
        ))}

        {/* phase 3: the stack resolves into the mark */}
        <motion.div
          style={{ opacity: logoOpacity, scale: logoScale }}
          className="absolute inset-0 z-[3] flex flex-col items-center justify-center"
        >
          <Image src="/satorl_logo.png" alt="" width={72} height={84} />
          <p
            className="mt-6 font-display text-[28px] font-black uppercase tracking-[0.1em]"
            style={{ color: INK }}
          >
            Satori<span style={{ color: "#D61F33" }}>.</span>Ventures
          </p>
          <p
            className="mt-2 font-mono text-[10px] uppercase tracking-[0.26em]"
            style={{ color: INK2 }}
          >
            Thesis assembled // Online
          </p>
        </motion.div>

        {/* scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          aria-hidden="true"
          className="absolute bottom-7 left-1/2 z-[3] -translate-x-1/2"
        >
          <span
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.26em]"
            style={{ color: INK2 }}
          >
            <ChevronDown className="chevron-pulse h-4 w-4" style={{ color: GOLD }} />
            Explore
          </span>
        </motion.div>
      </div>
    </section>
  );
}
