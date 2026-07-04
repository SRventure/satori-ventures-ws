"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Scramble from "@/components/Scramble";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
import { useReducedMotion } from "@/components/providers/Providers";

const DECODE_CHARS = "0123456789ABCDEF";

/* "digital decode": digits cycle random hex chars before locking */
function Decode({ value, active }: { value: string; active: boolean }) {
  const reduce = useReducedMotion();
  const [out, setOut] = useState(value.replace(/[0-9A-Z]/g, "0"));

  useEffect(() => {
    if (!active) return;
    if (reduce) {
      setOut(value);
      return;
    }
    const t0 = performance.now();
    const DUR = 800;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / DUR, 1);
      const locked = Math.floor(p * value.length);
      setOut(
        value
          .split("")
          .map((c, i) => {
            if (i < locked || !/[0-9A-Z]/i.test(c)) return c;
            return DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
          })
          .join("")
      );
      if (p < 1) raf = requestAnimationFrame(tick);
      else setOut(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, value, reduce]);

  return <span className="tabular-nums">{out}</span>;
}

const BARS = [
  { year: "22", h: 32 },
  { year: "23", h: 58 },
  { year: "24", h: 78 },
  { year: "25", h: 100 },
  { year: "26", h: 46 },
];

const CITY_DOTS = [
  { code: "DXB", x: 18, y: 44 },
  { code: "SIN", x: 62, y: 72, hq: true },
  { code: "TYO", x: 88, y: 26 },
];

function Panel({
  index,
  active,
  children,
}: {
  index: number;
  active: boolean;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  /* slight arc: center panel forward, sides angled back */
  const tilt = index === 0 ? 7 : index === 2 ? -7 : 0;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, rotateX: 60, y: 40 }}
      animate={active ? { opacity: 1, rotateX: 0, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.16, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card holo-flicker relative overflow-hidden p-7"
      style={{
        transform: `perspective(1200px) rotateY(${tilt}deg)`,
        boxShadow: "0 0 34px rgb(var(--accent-gold) / 0.07), inset 0 0 24px rgb(var(--accent-gold) / 0.04)",
      }}
    >
      {/* scanlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgb(var(--accent-gold) / 0.03) 0 1px, transparent 1px 4px)",
        }}
      />
      {children}
    </motion.div>
  );
}

export default function Stats() {
  const gridRef = useRef<HTMLDivElement>(null);
  const active = useInView(gridRef, { once: true, margin: "-100px" });
  const reduce = useReducedMotion();

  const RING_R = 30;
  const RING_C = 2 * Math.PI * RING_R;

  return (
    <section className="hairline-t bg-bg-2/40">
      <div className="mx-auto grid w-full max-w-wide grid-cols-1 lg:grid-cols-[0.85fr_1.15fr]">
        {/* sticky editorial column */}
        <div className="self-start px-6 py-20 md:px-10 md:py-28 lg:sticky lg:top-[72px]">
          <p className="eyebrow eyebrow-tick mb-7">
            <Scramble text="02 / By the numbers" />
          </p>
          <h2 className="display-lg text-[clamp(34px,4.6vw,58px)]">
            <VerticalCutReveal staggerDuration={0.02}>CONVICTION,</VerticalCutReveal>
            <br />
            <span className="text-gold">
              <VerticalCutReveal staggerDuration={0.02} delay={0.25}>
                MEASURED.
              </VerticalCutReveal>
            </span>
          </h2>
          <p className="mt-8 max-w-[420px] font-sans text-[17px] leading-relaxed text-ink">
            Capital is deployed one conviction at a time. Every position is a
            thesis about where the internet&apos;s next layer is being built.
          </p>
          <a
            href="#portfolio"
            className="pill-cta mt-12 text-ink transition-colors duration-300 hover:text-gold"
          >
            View collection
            <span className="pill-plus text-gold">+</span>
          </a>
        </div>

        {/* holographic panels */}
        <div ref={gridRef} className="px-6 py-16 md:px-10 md:py-24 lg:hairline-l">
          <div className="grid gap-6 md:grid-cols-3" style={{ perspective: 1400 }}>
            {/* investments + bar chart */}
            <Panel index={0} active={active}>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-crimson">01 // Deals</p>
              <p className="mt-3 font-display text-[52px] font-black leading-none text-gold">
                <Decode value="128+" active={active} />
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">
                Investments since 2022
              </p>
              <div className="mt-6 flex h-[64px] items-end gap-2">
                {BARS.map((b, i) => (
                  <div key={b.year} className="flex flex-1 flex-col items-center gap-1">
                    <motion.span
                      className="w-full bg-gold/80"
                      initial={reduce ? false : { height: 0 }}
                      animate={active ? { height: `${b.h * 0.52}px` } : {}}
                      transition={{ duration: 0.9, delay: 0.5 + i * 0.08, ease: [0.34, 1.4, 0.44, 1] }}
                      style={{ boxShadow: "0 0 8px rgb(var(--accent-gold) / 0.4)" }}
                    />
                    <span className="font-mono text-[8px] text-ink-2">{b.year}</span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* capital + progress ring */}
            <Panel index={1} active={active}>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-crimson">02 // Capital</p>
              <p className="mt-3 font-display text-[52px] font-black leading-none text-ink">
                <Decode value="$20M+" active={active} />
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">
                Deployed across Web3 &amp; AI
              </p>
              <div className="mt-5 flex items-center gap-4">
                <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden="true">
                  <circle cx="38" cy="38" r={RING_R} fill="none" stroke="rgb(var(--text-muted) / 0.2)" strokeWidth="2" />
                  <motion.circle
                    cx="38" cy="38" r={RING_R} fill="none"
                    stroke="rgb(var(--accent-gold))" strokeWidth="2" strokeLinecap="round"
                    strokeDasharray={RING_C}
                    initial={reduce ? false : { strokeDashoffset: RING_C }}
                    animate={active ? { strokeDashoffset: RING_C * 0.18 } : {}}
                    transition={{ duration: 1.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    transform="rotate(-90 38 38)"
                    style={{ filter: "drop-shadow(0 0 4px rgb(var(--accent-gold) / 0.6))" }}
                  />
                </svg>
                <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-ink-2">
                  <span className="text-gold">82%</span> conviction-
                  <br />
                  weighted allocation
                </p>
              </div>
            </Panel>

            {/* asia map */}
            <Panel index={2} active={active}>
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-crimson">03 // Rooted</p>
              <p className="mt-3 font-display text-[52px] font-black uppercase leading-none text-ink">
                Asia
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">
                Global reach, Asian core
              </p>
              <svg viewBox="0 0 100 90" className="mt-4 h-[84px] w-full" aria-hidden="true">
                {/* connective mesh */}
                <motion.path
                  d={`M${CITY_DOTS[0].x},${CITY_DOTS[0].y} L${CITY_DOTS[1].x},${CITY_DOTS[1].y} L${CITY_DOTS[2].x},${CITY_DOTS[2].y} L${CITY_DOTS[0].x},${CITY_DOTS[0].y}`}
                  fill="none"
                  stroke="rgb(var(--accent-gold) / 0.5)"
                  strokeWidth="0.7"
                  strokeDasharray="3 2"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={active ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.4, delay: 0.7 }}
                />
                {CITY_DOTS.map((c, i) => (
                  <g key={c.code}>
                    <circle cx={c.x} cy={c.y} r="2.4" fill={c.hq ? "rgb(var(--accent-red))" : "rgb(var(--accent-gold))"}>
                      {!reduce && (
                        <animate attributeName="opacity" values="1;0.4;1" dur="2.2s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
                      )}
                    </circle>
                    <text
                      x={c.x} y={c.y - 6}
                      textAnchor="middle"
                      className="fill-current text-ink-2"
                      style={{ fontSize: 6, fontFamily: "var(--font-mono)", letterSpacing: 1 }}
                    >
                      {c.code}
                    </text>
                  </g>
                ))}
              </svg>
            </Panel>
          </div>

          {/* footer strip: remaining stats */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={active ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-2"
          >
            <span>
              <span className="text-gold"><Decode value="26" active={active} /></span> portfolio companies
            </span>
            <span>
              <span className="text-gold"><Decode value="15+" active={active} /></span> sectors
            </span>
            <span>
              <span className="text-crimson">●</span> thesis online
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
