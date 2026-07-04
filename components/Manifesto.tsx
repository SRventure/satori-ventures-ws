"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Scramble from "@/components/Scramble";
import { useReducedMotion } from "@/components/providers/Providers";

const LINES = [
  { text: "Satori isn't just a fund.", accent: null as string | null },
  { text: "It's the result of unprecedented conviction", accent: "unprecedented conviction" },
  { text: "in the internet's next layer.", accent: "next layer" },
];

const SUPPORT = [
  "We invest in the potential of tomorrow, employing a keen, eagle-eyed approach to pinpoint opportunities that redefine what's possible — across Web3, blockchain infrastructure, and frontier AI.",
  "Our global perspective, fortified by a robust Asian market presence, ensures our partners are poised for international influence and success.",
];

/* per-character 3D fly-in from z-depth */
function Char({
  progress,
  char,
  from,
  to,
  seed,
}: {
  progress: MotionValue<number>;
  char: string;
  from: number;
  to: number;
  seed: number;
}) {
  const opacity = useTransform(progress, [from, to], [0, 1]);
  const z = useTransform(progress, [from, to], [-180 - seed * 140, 0]);
  const y = useTransform(progress, [from, to], [14 + seed * 26, 0]);
  return (
    <motion.span
      style={{ opacity, z, y, display: "inline-block", transformStyle: "preserve-3d" }}
    >
      {char === " " ? " " : char}
    </motion.span>
  );
}

function Line({
  progress,
  line,
  index,
}: {
  progress: MotionValue<number>;
  line: (typeof LINES)[number];
  index: number;
}) {
  /* line i owns scroll window [0.06+i*0.17, +0.15] */
  const w0 = 0.06 + index * 0.17;
  const w1 = w0 + 0.15;
  const chars = line.text.split("");
  const accentStart = line.accent ? line.text.indexOf(line.accent) : -1;
  const accentEnd = accentStart >= 0 ? accentStart + line.accent!.length : -1;

  /* accent emphasis kicks in just after the line lands */
  const emph = useTransform(progress, [w1, w1 + 0.06], [0, 1]);
  const aberration = useTransform(emph, (v) =>
    line.accent
      ? `${-3 * v}px 0 rgb(var(--accent-red) / ${0.55 * v}), ${3 * v}px 0 rgb(64 156 255 / ${0.4 * v}), 0 0 ${22 * v}px rgb(var(--accent-gold) / ${0.5 * v})`
      : "none"
  );
  const scale = useTransform(emph, [0, 1], [1, 1.06]);

  // deterministic per-char pseudo-random depth
  const seeds = chars.map((_, i) => Math.abs(Math.sin((index * 31 + i) * 12.9898)) % 1);

  return (
    <p
      className="display-lg mb-3 text-[clamp(28px,4.9vw,62px)] md:mb-4"
      style={{ perspective: 1000 }}
    >
      {/* group chars per word so the browser never wraps mid-word */}
      {line.text.split(" ").map((word, wi, words) => {
        const start = words.slice(0, wi).reduce((n, w) => n + w.length + 1, 0);
        return (
          <span key={wi}>
            <span
              className="inline-block whitespace-nowrap"
              style={{ transformStyle: "preserve-3d" }}
            >
              {word.split("").map((c, j) => {
                const i = start + j;
                const t0 = w0 + (i / chars.length) * 0.09;
                const inAccent = i >= accentStart && i < accentEnd;
                const node = (
                  <Char
                    key={i}
                    progress={progress}
                    char={c}
                    from={t0}
                    to={t0 + 0.05}
                    seed={seeds[i]}
                  />
                );
                if (!inAccent) return node;
                return (
                  <motion.span
                    key={i}
                    className="inline-block text-gold"
                    style={{ textShadow: aberration, scale, transformOrigin: "center bottom" }}
                  >
                    {node}
                  </motion.span>
                );
              })}
            </span>
            {wi < words.length - 1 && " "}
          </span>
        );
      })}
    </p>
  );
}

export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    setPinned(!reduce && window.innerWidth >= 640);
  }, [reduce]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /* background states: void → gold nebula → crimson glow */
  const nebulaGold = useTransform(scrollYProgress, [0.3, 0.5, 0.75, 0.9], [0, 0.14, 0.14, 0]);
  const nebulaRed = useTransform(scrollYProgress, [0.55, 0.75, 0.95], [0, 0.1, 0.02]);
  const supportOp = useTransform(scrollYProgress, [0.6, 0.72], [0, 1]);
  const supportBlur = useTransform(scrollYProgress, [0.6, 0.72], [8, 0]);
  const supportFilter = useTransform(supportBlur, (b) => `blur(${b}px)`);
  const supportY = useTransform(scrollYProgress, [0.6, 0.72], [30, 0]);
  const wipe = useTransform(scrollYProgress, [0.86, 0.98], [0, 1]);
  const wipeX = useTransform(wipe, (v) => `${-100 + v * 200}%`);
  const wipeOp = useTransform(wipe, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const progLine = useTransform(scrollYProgress, [0, 1], [0, 1]);

  /* NOTE: section + ref must render on the very first pass — an early-return
     fallback leaves useScroll bound to a null ref (see SatoriCube). */
  if (!pinned) {
    return (
      <section ref={ref} id="manifesto" className="relative px-6 py-24 md:px-10">
        <p className="eyebrow eyebrow-tick mb-8">01 / Our Philosophy</p>
        {LINES.map((l) => (
          <p key={l.text} className="display-lg mb-3 text-[clamp(28px,4.9vw,58px)]">
            {l.accent ? (
              <>
                {l.text.slice(0, l.text.indexOf(l.accent))}
                <span className="text-gold">{l.accent}</span>
                {l.text.slice(l.text.indexOf(l.accent) + l.accent.length)}
              </>
            ) : (
              l.text
            )}
          </p>
        ))}
        <div className="mt-12 grid max-w-wide gap-8 md:grid-cols-2 md:gap-16">
          {SUPPORT.map((s) => (
            <p key={s.slice(0, 16)} className="max-w-[520px] font-sans text-[17px] leading-relaxed text-ink">
              {s}
            </p>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="manifesto" className="relative h-[300svh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        {/* background state layers */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: nebulaGold,
            background:
              "radial-gradient(ellipse 70% 55% at 30% 40%, rgb(var(--accent-gold)) 0%, transparent 60%)",
          }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: nebulaRed,
            background:
              "radial-gradient(ellipse 65% 50% at 72% 65%, rgb(var(--accent-red)) 0%, transparent 60%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-wide px-6 md:px-10">
          <p className="eyebrow eyebrow-tick mb-10">
            <Scramble text="01 / Our Philosophy" />
          </p>

          {LINES.map((l, i) => (
            <Line key={l.text} progress={scrollYProgress} line={l} index={i} />
          ))}

          {/* supporting copy: blur-to-sharp */}
          <motion.div
            className="mt-14 grid gap-8 md:grid-cols-2 md:gap-16"
            style={{ opacity: supportOp, filter: supportFilter, y: supportY }}
          >
            {SUPPORT.map((s) => (
              <p key={s.slice(0, 16)} className="max-w-[520px] font-sans text-[16px] leading-relaxed text-ink">
                {s}
              </p>
            ))}
          </motion.div>
        </div>

        {/* scroll progress line */}
        <div className="absolute bottom-10 left-6 right-6 md:left-10 md:right-10" aria-hidden="true">
          <div className="h-px w-full bg-ink-3/30">
            <motion.div
              className="h-px origin-left bg-gold"
              style={{ scaleX: progLine, boxShadow: "0 0 8px rgb(var(--accent-gold) / 0.7)" }}
            />
          </div>
        </div>

        {/* exit wipe: gold line sweeps across */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-[2px] bg-gold"
          style={{
            left: wipeX,
            opacity: wipeOp,
            boxShadow: "0 0 24px rgb(var(--accent-gold))",
          }}
        />
      </div>
    </section>
  );
}
