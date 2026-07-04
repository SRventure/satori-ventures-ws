"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { useReducedMotion } from "@/components/providers/Providers";

const INK = "#F4EFE6";
const INK2 = "#93909b";
const GOLD = "#E2B84C";
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

/* one machine, four strata (bottom → top). Renders are alpha-keyed
   (black unmulted to transparency) so per-layer opacity is real —
   no blend-mode tricks, no black boxes. */
export const CUBE_LAYERS = [
  {
    img: "/aidc/l1_infra.webp",
    strata: "Physical Infrastructure",
    name: "The Renaissance",
    note: "The builders underneath it all",
    desc: "Server racks, liquid cooling, power — the physical substrate the whole conviction stands on.",
    accent: "#00d4ff",
    z: 10,
    depth: -90,
    baseOpacity: 1,
    blur: 1.1,
    asm: 15,
    exp: 31,
  },
  {
    img: "/aidc/l2_network.webp",
    strata: "Network & Connectivity",
    name: "Web3 Rails",
    note: "Chains, rollups, protocols",
    desc: "Fiber pathways and consensus rails — moving value the way the internet moves data.",
    accent: "#f59e0b",
    z: 20,
    depth: -25,
    baseOpacity: 0.85,
    blur: 0.5,
    asm: 5,
    exp: 10.5,
  },
  {
    img: "/aidc/l3_ai.webp",
    strata: "AI & Intelligence",
    name: "Frontier AI",
    note: "Models, agents, compute",
    desc: "GPU arrays and neural systems — the intelligence layer training on top of the rails.",
    accent: "#67e8f9",
    z: 30,
    depth: 30,
    baseOpacity: 0.7,
    blur: 0,
    asm: -5,
    exp: -10,
  },
  {
    img: "/aidc/l4_apps.webp",
    strata: "Application & Economy",
    name: "Open Economies",
    note: "Ownership, markets, incentives",
    desc: "Interfaces, protocols and token economies — where ownership finally reaches people.",
    accent: "#a855f7",
    z: 40,
    depth: 90,
    baseOpacity: 0.55,
    blur: 0,
    asm: -15,
    exp: -31,
  },
];

function ss(a: number, b: number, x: number) {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

/* separation envelope with per-layer parallax stagger; re-assembly is
   squared for a magnetic late snap */
function env(p: number, i: number) {
  const d = i * 0.02;
  const apart = ss(0.3 + d, 0.5 + d, p);
  const back = ss(0.68, 0.84 - i * 0.01, p);
  return apart * (1 - back * back);
}

function Layer({
  progress,
  index,
  focus,
  setFocus,
  onExpand,
  float,
}: {
  progress: MotionValue<number>;
  index: number;
  focus: number | null;
  setFocus: (i: number | null) => void;
  onExpand: (i: number) => void;
  float: boolean;
}) {
  const L = CUBE_LAYERS[index];
  /* depth is emulated as perspective-projected scale (1000px focal length):
     real translateZ + preserve-3d makes Chrome's compositor hit-test resolve
     pointer events to the wrapper, so hover/click never reach the layers */
  const depthScale = 1000 / (1000 - L.depth);
  const y = useTransform(
    progress,
    (p) => `calc(-50% + ${L.asm + (L.exp - L.asm) * env(p, index)}vh)`
  );
  const opacity = useTransform(progress, (p) => ss(0.02, 0.09, p) * (1 - ss(0.86, 0.96, p)));
  const scale = useTransform(progress, (p) => depthScale * (1 - ss(0.86, 0.97, p) * 0.3));
  const dim = focus !== null && focus !== index;

  return (
    <motion.div
      style={{ y, opacity, scale, x: "-50%", zIndex: L.z }}
      className="absolute left-1/2 top-1/2"
    >
      <motion.div
        animate={float ? { y: [0, -6, 0] } : undefined}
        transition={{ duration: 5 + index * 0.9, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label={`Inspect layer 0${index + 1} — ${L.name}`}
          onMouseEnter={() => setFocus(index)}
          onMouseLeave={() => setFocus(null)}
          onClick={() => onExpand(index)}
          onKeyDown={(e) => e.key === "Enter" && onExpand(index)}
          className="cursor-pointer outline-none"
          style={{
            opacity: dim ? 0.4 : focus === index ? 1 : L.baseOpacity,
            filter: dim ? "blur(2.5px)" : `blur(${focus === index ? 0 : L.blur}px)`,
            transform: `scale(${focus === index ? 1.04 : 1})`,
            transition: `opacity 0.3s ${EASE}, filter 0.3s ${EASE}, transform 0.3s ${EASE}`,
          }}
        >
          <Image
            src={L.img}
            alt=""
            width={1200}
            height={669}
            sizes="(max-width: 768px) 80vw, 560px"
            style={{ height: "min(17vh, 190px)", width: "auto" }}
            draggable={false}
          />
        </div>
      </motion.div>
    </motion.div>
  );
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

function FlowLine({
  progress,
  offset,
  color,
}: {
  progress: MotionValue<number>;
  offset: number;
  color: string;
}) {
  const opacity = useTransform(progress, (p) => env(p, 1) * 0.45);
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity, left: `calc(50% + ${offset}px)` }}
      className="absolute bottom-[10%] top-[12%] z-[5] w-px overflow-hidden"
    >
      <motion.div
        className="h-[200%] w-full"
        style={{
          background: `repeating-linear-gradient(to bottom, ${color} 0 10px, transparent 10px 26px)`,
        }}
        animate={{ y: ["-50%", "0%"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}

export default function SatoriCube() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [motionOn, setMotionOn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [focus, setFocus] = useState<number | null>(null);
  const [expand, setExpand] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    setMotionOn(!reduce);
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
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
            className="relative w-full max-w-[860px] rounded-lg border p-6 md:p-10"
            style={{ borderColor: `${CUBE_LAYERS[expand].accent}55`, background: "#101018" }}
          >
            <button
              onClick={() => setExpand(null)}
              aria-label="Close layer detail"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-300"
              style={{ borderColor: `${CUBE_LAYERS[expand].accent}66`, color: INK }}
            >
              <X className="h-4 w-4" />
            </button>
            <Image
              src={CUBE_LAYERS[expand].img}
              alt={`${CUBE_LAYERS[expand].strata} — ${CUBE_LAYERS[expand].name}`}
              width={1200}
              height={669}
              sizes="(max-width: 900px) 92vw, 780px"
              className="mx-auto w-full max-w-[680px]"
              style={{ height: "auto" }}
            />
            <p
              className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: CUBE_LAYERS[expand].accent }}
            >
              Layer 0{expand + 1} // {CUBE_LAYERS[expand].strata}
            </p>
            <h3
              className="mt-2 font-display text-[26px] font-black uppercase md:text-[36px]"
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
            <p className="mt-4 max-w-[560px] text-[14px] leading-relaxed" style={{ color: INK }}>
              {CUBE_LAYERS[expand].desc}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

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

  /* mobile: no 3D transforms — full-width strata, slide+fade reveal, tap to expand */
  if (isMobile) {
    return (
      <section
        ref={ref}
        className="hairline-t relative overflow-hidden px-5 py-20"
        style={{ backgroundColor: "#0a0a0f" }}
        aria-label="The Satori thesis — one conviction, four layers"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(to right, rgba(0,212,255,0.05) 0 1px, transparent 1px 72px), repeating-linear-gradient(to bottom, rgba(0,212,255,0.05) 0 1px, transparent 1px 72px)",
          }}
        />
        <div className="relative">
          <p
            className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: INK2 }}
          >
            <span style={{ color: "#D61F33" }}>—</span> 00 / Thesis architecture
          </p>
          <h2 className="display-lg text-[clamp(32px,9vw,44px)]" style={{ color: INK }}>
            ONE CONVICTION. <span style={{ color: GOLD }}>FOUR LAYERS.</span>
          </h2>
          <div className="mt-10 flex flex-col gap-5">
            {CUBE_LAYERS.map((l, i) => (
              <motion.div
                key={l.name}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => setExpand(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setExpand(i)}
                className="overflow-hidden rounded-lg border"
                style={{ borderColor: `${l.accent}44`, background: "#101018" }}
              >
                <Image
                  src={l.img}
                  alt={`${l.strata} — ${l.name}`}
                  width={1200}
                  height={669}
                  sizes="92vw"
                  className="w-full"
                  style={{ height: "auto" }}
                />
                <div className="flex items-end justify-between p-4">
                  <div>
                    <p
                      className="font-mono text-[9px] uppercase tracking-[0.2em]"
                      style={{ color: l.accent }}
                    >
                      Layer 0{i + 1} // {l.strata}
                    </p>
                    <p
                      className="mt-1 font-display text-[19px] font-black uppercase"
                      style={{ color: INK }}
                    >
                      {l.name}
                    </p>
                    <p
                      className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em]"
                      style={{ color: INK2 }}
                    >
                      {l.note}
                    </p>
                  </div>
                  <span
                    className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em]"
                    style={{ color: l.accent }}
                  >
                    Tap ↗
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {expandOverlay}
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

        {/* data flow between strata */}
        <FlowLine progress={scrollYProgress} offset={-150} color="rgba(0,212,255,0.8)" />
        <FlowLine progress={scrollYProgress} offset={150} color="rgba(168,85,247,0.8)" />

        {/* the stack — perspective depth emulated per layer (see Layer) */}
        <div className="absolute inset-0">
          {CUBE_LAYERS.map((_, i) => (
            <Layer
              key={i}
              progress={scrollYProgress}
              index={i}
              focus={focus}
              setFocus={setFocus}
              onExpand={setExpand}
              float={motionOn}
            />
          ))}
        </div>

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
          <h2
            className="display-lg text-[clamp(34px,5.8vw,72px)]"
            style={{ color: INK }}
          >
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
          className="absolute bottom-7 left-1/2 z-[46] -translate-x-1/2"
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
