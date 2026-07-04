"use client";

import { motion } from "framer-motion";
import { focusAreas } from "@/lib/companies";
import Scramble from "@/components/Scramble";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
import { useReducedMotion } from "@/components/providers/Providers";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Focus() {
  const reduce = useReducedMotion();
  const featured = focusAreas.find((f) => f.featured)!;
  const rest = focusAreas.filter((f) => !f.featured);

  const reveal = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 44 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.9, ease: EASE, delay: i * 0.12 },
        };

  return (
    <section id="focus" className="hairline-t py-28 md:py-36">
      <div className="mx-auto w-full max-w-wide px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow-tick mb-6">
              <Scramble text="04 / Where we invest" />
            </p>
            <h2 className="display-lg max-w-[820px] text-[clamp(34px,4.8vw,60px)]">
              <VerticalCutReveal staggerDuration={0.02}>THREE THESES,</VerticalCutReveal>
              <br />
              <span className="text-gold">
                <VerticalCutReveal staggerDuration={0.02} delay={0.2}>
                  ONE CONVICTION.
                </VerticalCutReveal>
              </span>
            </h2>
          </div>
          <p className="annotation max-w-[240px] text-ink-2">
            Web3 rails, frontier AI, open economies — the stack the next internet runs
            on<span className="text-crimson">*</span>
          </p>
        </div>

        <div className="mt-16 grid gap-7 lg:grid-cols-2">
          {/* featured card */}
          <motion.article
            {...reveal(0)}
            className="dashed-frame group relative overflow-hidden bg-bg-2 p-10 transition-colors duration-500 hover:border-crimson/60 md:p-14 lg:row-span-2"
          >
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-[340px] w-[340px] rounded-full opacity-[0.10] transition-transform duration-700 ease-luxe group-hover:translate-x-[-10px] group-hover:translate-y-[10px]"
              style={{ background: "radial-gradient(circle, rgb(var(--accent-gold)) 0%, transparent 62%)" }}
            />
            <span className="inline-block rounded-full border border-crimson/60 bg-crimson/10 px-4 py-1 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
              Featured thesis
            </span>
            <h3 className="mt-8 font-display text-[32px] font-black uppercase leading-[1.02] tracking-[-0.01em] text-ink md:text-[44px]">
              {featured.title}
            </h3>
            <p className="mt-6 max-w-[440px] font-sans text-[16px] leading-relaxed text-ink md:text-[17px]">
              {featured.body}
            </p>
            <p className="mt-10 font-sans text-[14px] tracking-wide text-ink-2">
              <span className="font-display text-[12px] font-bold uppercase tracking-[0.18em] text-crimson">
                In portfolio —{" "}
              </span>
              {featured.companies}
            </p>
          </motion.article>

          {rest.map((f, i) => (
            <motion.article
              key={f.title}
              {...reveal(i + 1)}
              className="dashed-frame group relative overflow-hidden bg-bg-2 p-10 transition-colors duration-500 hover:border-gold/70 md:p-12"
            >
              <div
                aria-hidden="true"
                className="absolute -bottom-16 -right-16 h-[220px] w-[220px] rounded-full opacity-[0.07] transition-transform duration-700 ease-luxe group-hover:translate-y-[-10px]"
                style={{ background: "radial-gradient(circle, rgb(var(--accent-gold)) 0%, transparent 62%)" }}
              />
              <h3 className="font-display text-[26px] font-black uppercase leading-[1.05] tracking-[-0.01em] text-ink md:text-[32px]">
                {f.title}
              </h3>
              <p className="mt-4 max-w-[440px] font-sans text-[15px] leading-relaxed text-ink">
                {f.body}
              </p>
              <p className="mt-7 font-sans text-[14px] tracking-wide text-ink-2">
                <span className="font-display text-[12px] font-bold uppercase tracking-[0.18em] text-crimson">
                  In portfolio —{" "}
                </span>
                {f.companies}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
