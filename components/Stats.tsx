"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { stats } from "@/lib/companies";
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
    <section className="border-y border-ink-3/25 bg-bg-2/60">
      <div className="mx-auto grid w-full max-w-wide grid-cols-2 gap-y-14 px-6 py-20 md:px-10 md:py-24 lg:grid-cols-4 lg:divide-x lg:divide-ink-3/25">
        {stats.map((s) => (
          <div key={s.label} className="px-4 text-center">
            <p
              className={`font-serif text-[46px] leading-none md:text-[60px] ${
                s.highlight ? "text-gold" : "text-ink"
              }`}
            >
              <Counter end={s.end} prefix={s.prefix ?? ""} suffix={s.suffix} />
            </p>
            <p className="mt-4 font-sans text-[12px] font-medium uppercase tracking-[0.2em] text-ink">
              {s.label}
            </p>
            <p className="mt-1 font-sans text-[13px] text-ink-2">{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
