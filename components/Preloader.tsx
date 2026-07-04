"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* Boot sequence timeline (ms):
   0    dot appears
   150  dot stretches into horizontal line
   450  line splits vertically into a frame
   750  scanline sweep reveals the mark
   1250 "SATORI" types in with block cursor
   1750 "VENTURES" fades in
   2000 tagline fades in
   2450 frame expands outward, veil fades
   3050 done */
const T_LINE = 150;
const T_FRAME = 450;
const T_SCAN = 750;
const T_TYPE = 1250;
const T_SUB = 1750;
const T_TAG = 2000;
const T_EXPAND = 2450;
const T_DONE = 3050;

const WORD = "SATORI";

export default function Preloader() {
  const [t, setT] = useState(0);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const finish = () => {
      setDone(true);
      document.documentElement.setAttribute("data-loaded", "true");
      window.dispatchEvent(new Event("satori:loaded"));
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("satori-preloaded");
    if (reduced || seen) {
      setDone(true);
      document.documentElement.setAttribute("data-loaded", "true");
      return;
    }

    document.documentElement.setAttribute("data-loaded", "false");
    /* accumulate clamped deltas so a janky rAF (heavy WebGL compile) stretches
       the sequence instead of skipping stages */
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      acc += Math.min(now - last, 50);
      last = now;
      setT(acc);
      if (acc < T_DONE) {
        raf = requestAnimationFrame(tick);
      } else {
        sessionStorage.setItem("satori-preloaded", "1");
        finish();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (done) return null;

  const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
  const ease = (v: number) => 1 - Math.pow(1 - v, 3);

  const lineP = ease(clamp01((t - T_LINE) / 280));
  const frameP = ease(clamp01((t - T_FRAME) / 280));
  const scanP = ease(clamp01((t - T_SCAN) / 460));
  const typedChars = Math.floor(clamp01((t - T_TYPE) / 420) * WORD.length);
  const subP = ease(clamp01((t - T_SUB) / 240));
  const tagP = ease(clamp01((t - T_TAG) / 300));
  const expandP = ease(clamp01((t - T_EXPAND) / 550));

  const cursorOn = t >= T_TYPE && Math.floor(t / 350) % 2 === 0;
  const frameW = 300;
  const frameH = 220;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{
        background: "rgb(var(--bg-primary))",
        opacity: 1 - expandP,
      }}
    >
      {/* boot frame: dot → line → rectangle, then expands into the viewport */}
      <div
        className="absolute"
        style={{
          width: frameW,
          height: frameH,
          transform: `scale(${1 + expandP * 19})`,
          opacity: expandP > 0 ? 1 - expandP * 0.9 : 1,
        }}
      >
        {/* horizontal rails (the initial line = top rail at center) */}
        <span
          className="absolute left-0 right-0 bg-gold"
          style={{
            height: 1,
            top: `${50 - frameP * 50}%`,
            transform: `scaleX(${t < T_LINE ? 0.02 : lineP})`,
            boxShadow: "0 0 12px rgb(var(--accent-gold) / 0.8)",
          }}
        />
        <span
          className="absolute left-0 right-0 bg-gold"
          style={{
            height: 1,
            top: `${50 + frameP * 50}%`,
            transform: `scaleX(${lineP})`,
            opacity: frameP > 0 ? 1 : 0,
            boxShadow: "0 0 12px rgb(var(--accent-gold) / 0.8)",
          }}
        />
        {/* vertical rails grow as the line splits */}
        <span
          className="absolute left-0 top-1/2 w-px -translate-y-1/2 bg-gold"
          style={{ height: `${frameP * 100}%`, boxShadow: "0 0 10px rgb(var(--accent-gold) / 0.6)" }}
        />
        <span
          className="absolute right-0 top-1/2 w-px -translate-y-1/2 bg-gold"
          style={{ height: `${frameP * 100}%`, boxShadow: "0 0 10px rgb(var(--accent-gold) / 0.6)" }}
        />

        {/* frame interior */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-hidden">
          {/* scanline-revealed mark */}
          <div
            className="relative"
            style={{
              clipPath: `inset(0 0 ${(1 - scanP) * 100}% 0)`,
              opacity: frameP,
            }}
          >
            <Image src="/satorl_logo.png" alt="" width={52} height={60} className="company-logo" priority />
            {/* moving scan bar */}
            {scanP > 0 && scanP < 1 && (
              <span
                className="absolute inset-x-[-14px] h-[2px] bg-gold"
                style={{
                  top: `${scanP * 100}%`,
                  boxShadow: "0 0 14px rgb(var(--accent-gold))",
                }}
              />
            )}
          </div>

          {/* typewriter wordmark */}
          <p className="font-mono text-[20px] font-semibold tracking-[0.34em] text-gold" style={{ minHeight: 28 }}>
            {WORD.slice(0, typedChars)}
            <span
              className="ml-[2px] inline-block h-[18px] w-[9px] translate-y-[3px] bg-gold"
              style={{ opacity: cursorOn && typedChars < WORD.length + 2 ? 1 : 0 }}
            />
          </p>

          <p
            className="font-mono text-[10px] uppercase tracking-[0.5em] text-ink-2"
            style={{ opacity: subP, transform: `translateY(${(1 - subP) * 8}px)` }}
          >
            Ventures
          </p>
        </div>

        {/* scanline texture over the frame */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: frameP * 0.5 * (1 - expandP),
            background:
              "repeating-linear-gradient(to bottom, rgb(var(--accent-gold) / 0.05) 0 1px, transparent 1px 4px)",
          }}
        />
      </div>

      {/* tagline below the frame */}
      <p
        className="absolute font-mono text-[10px] uppercase tracking-[0.3em] text-ink-2"
        style={{
          top: `calc(50% + ${frameH / 2 + 34}px)`,
          opacity: tagP * (1 - expandP),
          transform: `translateY(${(1 - tagP) * 10}px)`,
        }}
      >
        Fostering the Blockchain Renaissance
      </p>

      {/* boot telemetry corner */}
      <p
        className="absolute bottom-6 left-6 font-mono text-[9px] uppercase tracking-[0.24em] text-ink-2"
        style={{ opacity: (1 - expandP) * 0.7 }}
      >
        S.A.T.O.R.I. boot // {String(Math.min(Math.round((t / T_EXPAND) * 100), 100)).padStart(3, "0")}%
      </p>
    </div>
  );
}
