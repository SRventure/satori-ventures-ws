"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { stats } from "@/lib/companies";
import Scramble from "@/components/Scramble";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
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

export default function Stats() {
  return (
    <section className="hairline-t bg-bg-2/40">
      <div className="mx-auto grid w-full max-w-wide grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
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

        {/* stat rows */}
        <div className="lg:hairline-l">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className={`flex flex-col gap-4 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-12 md:py-14 ${
                i > 0 ? "hairline-t" : ""
              }`}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <span
                className={`font-display text-[64px] font-black leading-none tracking-[-0.02em] md:text-[96px] ${
                  s.highlight ? "text-gold" : "text-ink"
                }`}
              >
                <Counter end={s.end} prefix={s.prefix ?? ""} suffix={s.suffix} />
              </span>
              <div className="md:max-w-[240px] md:text-right">
                <p className="font-display text-[14px] font-bold uppercase tracking-[0.18em] text-ink">
                  <span className="mr-2 font-mono text-[12px] text-crimson">0{i + 1}</span>
                  {s.label}
                </p>
                <p className="mt-2 font-sans text-[15px] leading-relaxed text-ink-2">
                  {s.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
