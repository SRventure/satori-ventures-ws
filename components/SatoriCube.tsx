"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { useReducedMotion } from "@/components/providers/Providers";

const CubeCanvas = dynamic(() => import("./SatoriCubeScene"), { ssr: false });

const INK = "#F4EFE6";
const INK2 = "#93909b";
const GOLD = "#E2B84C";
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

/* four strata, bottom → top — indices match the WebGL slabs */
export const CUBE_LAYERS = [
  {
    strata: "Physical Infrastructure",
    name: "The Renaissance",
    note: "The builders underneath it all",
    desc: "Compute, power, capital — the physical substrate the whole conviction stands on.",
    accent: "#00d4ff",
  },
  {
    strata: "Network & Connectivity",
    name: "Web3 Rails",
    note: "Chains, rollups, protocols",
    desc: "Consensus rails and rollups — moving value the way the internet moves data.",
    accent: "#f59e0b",
  },
  {
    strata: "AI & Intelligence",
    name: "Frontier AI",
    note: "Models, agents, compute",
    desc: "Models and autonomous agents — the intelligence layer training on top of the rails.",
    accent: "#67e8f9",
  },
  {
    strata: "Application & Economy",
    name: "Open Economies",
    note: "Ownership, markets, incentives",
    desc: "Interfaces, protocols and token economies — where ownership finally reaches people.",
    accent: "#a855f7",
  },
];

function ss(a: number, b: number, x: number) {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

function env(p: number, i: number) {
  const d = i * 0.02;
  const apart = ss(0.3 + d, 0.5 + d, p);
  const back = ss(0.68, 0.84 - i * 0.01, p);
  return apart * (1 - back * back);
}

function LayerLabel({
  progress,
  index,
  focus,
}: {
  progress: MotionValue<number>;
  index: number;
  focus: number | null;
}) {
  const L = CUBE_LAYERS[index];
  const side = index % 2 === 0 ? "left" : "right";
  const top = ["74%", "55%", "36%", "14%"][index];
  const t0 = 0.32 + (3 - index) * 0.05;
  const opacity = useTransform(progress, [t0, t0 + 0.08, 0.7, 0.8], [0, 1, 1, 0]);
  const x = useTransform(progress, [t0, t0 + 0.08], side === "left" ? [-28, 0] : [28, 0]);
  const line = useTransform(progress, [t0 + 0.04, t0 + 0.14], [0, 1]);
  const dim = focus !== null && focus !== index;

  return (
    <motion.div
      style={{ opacity, x, top }}
      className={`pointer-events-none absolute z-[45] w-[150px] md:w-[240px] ${
        side === "left" ? "left-[4%] text-left md:left-[6%]" : "right-[4%] text-right md:right-[6%]"
      }`}
    >
      <div style={{ opacity: dim ? 0.35 : 1, transition: `opacity 0.3s ${EASE}` }}>
        <p
          className="font-mono text-[8px] uppercase tracking-[0.18em] md:text-[10px]"
          style={{ color: L.accent }}
        >
          Layer 0{index + 1} // {L.strata}
        </p>
        <p
          className="mt-1 font-display text-[14px] font-black uppercase tracking-[0.04em] md:text-[22px]"
          style={{ color: INK }}
        >
          {L.name}
        </p>
        <motion.span
          style={{ scaleX: line, backgroundColor: L.accent }}
          className={`mt-1 block h-[2px] w-full ${
            side === "left" ? "origin-left" : "origin-right"
          }`}
        />
        <p
          className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] md:text-[10px]"
          style={{ color: INK2 }}
        >
          {L.note}
        </p>
      </div>
    </motion.div>
  );
}

export default function SatoriCube() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [webgl, setWebgl] = useState(false);
  const [focus, setFocusState] = useState<number | null>(null);
  const [expand, setExpand] = useState<number | null>(null);
  const focusRef = useRef<number | null>(null);
  const near = useInView(ref, { margin: "600px 0px 600px 0px" });

  const setFocus = (i: number | null) => {
    focusRef.current = i;
    setFocusState(i);
  };

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

  useEffect(() => {
    const lenis = window.__lenis;
    if (expand === null) {
      lenis?.start();
      return;
    }
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpand(null);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [expand]);

  const headOpacity = useTransform(scrollYProgress, [0.02, 0.1, 0.26, 0.34], [0, 1, 1, 0]);
  const headY = useTransform(scrollYProgress, [0.02, 0.1], [24, 0]);
  const hintOpacity = useTransform(scrollYProgress, [0.04, 0.14], [1, 0]);
  const inspectOpacity = useTransform(scrollYProgress, (p) => env(p, 1) * 0.8);
  const glowOpacity = useTransform(
    scrollYProgress,
    (p) => 0.3 + env(p, 1) * 0.4 - ss(0.86, 0.96, p) * 0.55
  );
  const logoOpacity = useTransform(scrollYProgress, [0.86, 0.97], [0, 1]);
  const logoScale = useTransform(scrollYProgress, [0.86, 0.98], [0.7, 1]);

  const expandOverlay = (
    <AnimatePresence>
      {expand !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          onClick={() => setExpand(null)}
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto p-5 md:p-10"
          style={{
            background: "rgba(5, 5, 8, 0.78)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <motion.div
            initial={{ scale: 0.88, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[720px] overflow-hidden rounded-lg border p-6 md:p-12"
            style={{ borderColor: `${CUBE_LAYERS[expand].accent}55`, background: "#101018" }}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-4 -top-10 font-display text-[150px] font-black leading-none md:text-[220px]"
              style={{ color: `${CUBE_LAYERS[expand].accent}14` }}
            >
              0{expand + 1}
            </span>
            <button
              onClick={() => setExpand(null)}
              aria-label="Close layer detail"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-300"
              style={{ borderColor: `${CUBE_LAYERS[expand].accent}66`, color: INK }}
            >
              <X className="h-4 w-4" />
            </button>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: CUBE_LAYERS[expand].accent }}
            >
              Layer 0{expand + 1} // {CUBE_LAYERS[expand].strata}
            </p>
            <h3
              className="mt-3 font-display text-[30px] font-black uppercase md:text-[44px]"
              style={{ color: INK }}
            >
              {CUBE_LAYERS[expand].name}
            </h3>
            <p
              className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em]"
              style={{ color: INK2 }}
            >
              {CUBE_LAYERS[expand].note}
            </p>
            <span
              className="mt-5 block h-[2px] w-14"
              style={{ backgroundColor: CUBE_LAYERS[expand].accent }}
            />
            <p className="mt-5 max-w-[520px] text-[15px] leading-relaxed" style={{ color: INK }}>
              {CUBE_LAYERS[expand].desc}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
      <div
        className="sticky top-0 isolate h-[100svh] overflow-hidden"
        style={{ backgroundColor: "#0a0a0f" }}
      >
        {/* stage atmosphere */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: glowOpacity,
            background:
              "radial-gradient(ellipse 60% 45% at 50% 62%, rgba(0, 212, 255, 0.10) 0%, transparent 60%), radial-gradient(ellipse 42% 32% at 50% 26%, rgba(168, 85, 247, 0.09) 0%, transparent 65%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(to right, rgba(0,212,255,0.05) 0 1px, transparent 1px 72px), repeating-linear-gradient(to bottom, rgba(0,212,255,0.05) 0 1px, transparent 1px 72px)",
          }}
        />

        {/* the model — R3F raycast drives hover/click on the slabs */}
        {near && (
          <div className="absolute inset-0 z-[10]">
            <CubeCanvas
              progress={progRef}
              focusRef={focusRef}
              onFocus={setFocus}
              onExpand={setExpand}
            />
          </div>
        )}

        {/* vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[42]"
          style={{
            background:
              "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        {/* phase 1: heading */}
        <motion.div
          style={{ opacity: headOpacity, y: headY }}
          className="pointer-events-none absolute inset-x-0 top-[10vh] z-[46] text-center"
        >
          <p
            className="mb-5 inline-block font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: INK2 }}
          >
            <span style={{ color: "#D61F33" }}>—</span> 00 / Thesis architecture
          </p>
          <h2 className="display-lg text-[clamp(34px,5.8vw,72px)]" style={{ color: INK }}>
            ONE CONVICTION. <span style={{ color: GOLD }}>FOUR LAYERS.</span>
          </h2>
        </motion.div>

        {/* phase 2: layer labels */}
        {CUBE_LAYERS.map((_, i) => (
          <LayerLabel key={i} progress={scrollYProgress} index={i} focus={focus} />
        ))}
        <motion.p
          style={{ opacity: inspectOpacity, color: INK2 }}
          className="pointer-events-none absolute inset-x-0 bottom-[5vh] z-[46] text-center font-mono text-[9px] uppercase tracking-[0.26em]"
        >
          <span
            style={{ opacity: focus === null ? 1 : 0, transition: `opacity 0.3s ${EASE}` }}
          >
            Hover a layer // click to inspect
          </span>
        </motion.p>

        {/* phase 3: the stack resolves into the mark */}
        <motion.div
          style={{ opacity: logoOpacity, scale: logoScale }}
          className="pointer-events-none absolute inset-0 z-[46] flex flex-col items-center justify-center"
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
          className="pointer-events-none absolute bottom-7 left-1/2 z-[46] -translate-x-1/2"
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
      {expandOverlay}
    </section>
  );
}
