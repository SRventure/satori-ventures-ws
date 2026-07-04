"use client";

import { motion } from "framer-motion";
import { focusAreas } from "@/lib/companies";
import Scramble from "@/components/Scramble";
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
    <section id="focus" className="py-28 md:py-36">
      <div className="mx-auto w-full max-w-wide px-6 md:px-10">
        <p className="eyebrow eyebrow-tick mb-4"><Scramble text="Where We Invest" /></p>
        <h2 className="max-w-[760px] font-serif text-[40px] leading-tight text-ink md:text-[56px]">
          Three theses, <span className="italic text-gold">one</span> conviction
        </h2>

        <div className="mt-16 grid gap-7 lg:grid-cols-2">
          {/* featured card */}
          <motion.article
            {...reveal(0)}
            className="group relative overflow-hidden border border-ink-3/30 bg-bg-2 p-10 transition-colors duration-500 hover:border-crimson/50 md:p-14 lg:row-span-2"
          >
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-[340px] w-[340px] rounded-full opacity-[0.10] transition-transform duration-700 ease-luxe group-hover:translate-x-[-10px] group-hover:translate-y-[10px]"
              style={{ background: "radial-gradient(circle, rgb(var(--accent-gold)) 0%, transparent 62%)" }}
            />
            <span className="inline-block rounded-full border border-crimson/60 bg-crimson/10 px-4 py-1 font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-crimson">
              Featured thesis
            </span>
            <h3 className="nav-link mt-8 inline-block font-serif text-[36px] leading-tight text-ink md:text-[48px]">
              {featured.title}
            </h3>
            <p className="mt-6 max-w-[440px] font-sans text-[16px] font-light leading-relaxed text-ink-2 md:text-[17px]">
              {featured.body}
            </p>
            <p className="mt-10 font-sans text-[13px] tracking-wide text-ink-2/80">
              <span className="text-crimson">In portfolio —</span> {featured.companies}
            </p>
          </motion.article>

          {rest.map((f, i) => (
            <motion.article
              key={f.title}
              {...reveal(i + 1)}
              className="group relative overflow-hidden border border-ink-3/30 bg-bg-2 p-10 transition-colors duration-500 hover:border-gold/60 md:p-12"
            >
              <div
                aria-hidden="true"
                className="absolute -right-16 -bottom-16 h-[220px] w-[220px] rounded-full opacity-[0.07] transition-transform duration-700 ease-luxe group-hover:translate-y-[-10px]"
                style={{ background: "radial-gradient(circle, rgb(var(--accent-cyan)) 0%, transparent 62%)" }}
              />
              <h3 className="nav-link inline-block font-serif text-[28px] leading-tight text-ink md:text-[34px]">
                {f.title}
              </h3>
              <p className="mt-4 max-w-[440px] font-sans text-[15px] font-light leading-relaxed text-ink-2">
                {f.body}
              </p>
              <p className="mt-7 font-sans text-[13px] tracking-wide text-ink-2/80">
                <span className="text-crimson">In portfolio —</span> {f.companies}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
