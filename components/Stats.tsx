"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { stats } from "@/lib/companies";
import Scramble from "@/components/Scramble";
import { useReducedMotion } from "@/components/providers/Providers";

function Counter({
  end,
  prefix = "",
  suffix = "",
}: {
  end: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(end);
      return;
    }
    const t0 = performance.now();
    const dur = 1600;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      setVal(Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, reduce]);

  return (
    <span ref={ref}>
      {prefix}
      {val}
      {suffix}
    </span>
  );
}

/* big serif figure with trailing ghost copies (OYLA echo) */
function GhostFigure({
  text,
  highlight,
  children,
}: {
  text: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <span
      className={`ghost-echo font-serif text-[58px] leading-[0.95] md:text-[84px] ${
        highlight ? "text-gold" : "text-ink"
      }`}
    >
      {!reduce && (
        <>
          <motion.span
            aria-hidden="true"
            className="echo"
            initial={{ y: 0, opacity: 0 }}
            whileInView={{ y: "0.42em", opacity: 0.08 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          >
            {text}
          </motion.span>
          <motion.span
            aria-hidden="true"
            className="echo"
            initial={{ y: 0, opacity: 0 }}
            whileInView={{ y: "0.21em", opacity: 0.2 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            {text}
          </motion.span>
        </>
      )}
      <motion.span
        className="relative inline-block"
        initial={reduce ? false : { y: 28, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Stats() {
  return (
    <section className="hairline-t bg-bg-2/40">
      <div className="mx-auto grid w-full max-w-wide grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
        {/* sticky editorial column */}
        <div className="self-start px-6 py-20 md:px-10 md:py-28 lg:sticky lg:top-[72px]">
          <p className="eyebrow eyebrow-tick mb-7">
            <Scramble text="By the numbers" />
          </p>
          <h2 className="font-serif text-[38px] leading-[1.08] text-ink md:text-[52px]">
            Conviction,
            <br />
            <span className="italic text-gold">measured</span>
            <span className="text-crimson">.</span>
          </h2>
          <p className="mt-8 max-w-[400px] font-sans text-[15px] font-light leading-relaxed text-ink-2 md:text-[16px]">
            Capital is deployed one conviction at a time — no index bets, no
            spray-and-pray. Every position is a thesis about where the
            internet&apos;s next layer is being built.
          </p>
          <a
            href="#portfolio"
            className="pill-cta mt-12 text-ink-2 transition-colors duration-300 hover:text-ink"
          >
            View collection
            <span className="pill-plus text-gold">+</span>
          </a>
        </div>

        {/* hairline stat rows */}
        <div className="lg:hairline-l">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col gap-4 px-6 py-12 md:flex-row md:items-end md:justify-between md:px-12 md:py-16 ${
                i > 0 ? "hairline-t" : ""
              }`}
            >
              <div className="overflow-visible pb-4 md:pb-8">
                <GhostFigure
                  text={`${s.prefix ?? ""}${s.end}${s.suffix ?? ""}`}
                  highlight={s.highlight}
                >
                  <Counter end={s.end} prefix={s.prefix ?? ""} suffix={s.suffix} />
                </GhostFigure>
              </div>
              <div className="md:max-w-[220px] md:text-right">
                <p className="font-sans text-[12px] font-medium uppercase tracking-[0.22em] text-ink">
                  <span className="mr-2 text-crimson">0{i + 1}</span>
                  {s.label}
                </p>
                <p className="mt-2 font-sans text-[13px] font-light leading-relaxed text-ink-2">
                  {s.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
