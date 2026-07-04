"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { companies, type Company } from "@/lib/companies";
import Scramble from "@/components/Scramble";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
import { BorderBeam } from "@/components/ui/border-beam";
import { useReducedMotion } from "@/components/providers/Providers";

function Card({
  c,
  index,
  hovered,
  onHover,
}: {
  c: Company;
  index: number;
  hovered: boolean;
  onHover: (i: number | null) => void;
}) {
  return (
    <a
      href={c.url}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-label="View"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      className="dashed-frame group relative block w-[78vw] shrink-0 select-none overflow-hidden bg-bg-2/60 transition-colors duration-500 hover:bg-bg-2 sm:w-[420px]"
      style={{ aspectRatio: "16 / 10" }}
    >
      {hovered && <BorderBeam size={70} duration={4} />}

      {/* index */}
      <span className="absolute left-5 top-4 font-display text-[12px] font-semibold tracking-[0.2em] text-ink-2 transition-colors duration-300 group-hover:text-crimson">
        №{String(index + 1).padStart(2, "0")}
      </span>

      {/* logo plate */}
      <div className="flex h-[58%] items-center justify-center px-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={c.logo}
          alt={`${c.name} logo`}
          loading="lazy"
          className="company-logo max-h-[56px] w-auto max-w-[70%] transition-transform duration-500 ease-luxe group-hover:scale-105"
        />
      </div>

      {/* caption */}
      <div
        className="absolute inset-x-0 bottom-0 px-6 py-4 backdrop-blur-md"
        style={{ background: "var(--glass)", borderTop: "1px solid var(--hairline)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-crimson">
              {c.category}
            </p>
            <p className="mt-1 font-display text-[21px] font-bold uppercase leading-tight tracking-[0.01em] text-ink">
              {c.name}
            </p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-ink-2 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" />
        </div>
        <p className="mt-2 line-clamp-2 font-sans text-[14px] leading-relaxed text-ink-2 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
          {c.description}
        </p>
      </div>

      {/* gold–crimson glow on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow:
            "inset 0 0 60px rgb(var(--accent-gold) / 0.1), inset 0 -24px 60px rgb(var(--accent-red) / 0.07)",
        }}
      />
    </a>
  );
}

export default function Portfolio() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [horizontal, setHorizontal] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    setHorizontal(!reduce && window.innerWidth >= 1024);
  }, [reduce]);

  useEffect(() => {
    if (!horizontal) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    const bar = barRef.current;
    if (!section || !track || !bar) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const getDist = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -getDist(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getDist()}`,
          scrub: 0.5,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            bar.style.transform = `scaleX(${self.progress})`;
          },
        },
      });
    }, section);

    return () => ctx.revert();
  }, [horizontal]);

  return (
    <section ref={sectionRef} id="portfolio" className="relative overflow-hidden py-24 lg:h-screen lg:py-0">
      <div className="flex h-full flex-col justify-center">
        <div className="mx-auto flex w-full max-w-wide items-end justify-between px-6 md:px-10">
          <div>
            <p className="eyebrow eyebrow-tick mb-6">
              <Scramble text="03 / Portfolio" />
            </p>
            <h2 className="display-lg text-[clamp(34px,4.8vw,60px)]">
              <VerticalCutReveal staggerDuration={0.02}>THE COMPANIES</VerticalCutReveal>
              <br />
              <span className="text-gold">
                <VerticalCutReveal staggerDuration={0.02} delay={0.2}>
                  REDEFINING TOMORROW
                </VerticalCutReveal>
              </span>
            </h2>
          </div>
          <p className="annotation hidden shrink-0 max-w-[200px] pb-2 text-right text-ink-2 md:block">
            <span className="text-crimson">26</span> positions
            <br />
            drag through the collection
          </p>
        </div>

        <div
          ref={trackRef}
          className={`mt-14 flex gap-7 px-6 md:px-10 ${
            horizontal
              ? "w-max"
              : "snap-x snap-mandatory overflow-x-auto pb-6 [scrollbar-width:thin]"
          }`}
        >
          {companies.map((c, i) => (
            <motion.div
              key={c.name}
              className={horizontal ? "" : "snap-start"}
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: (i % 5) * 0.05 }}
            >
              <Card c={c} index={i} hovered={hovered === i} onHover={setHovered} />
            </motion.div>
          ))}
        </div>

        {/* progress bar */}
        {horizontal && (
          <div className="mx-auto mt-12 w-full max-w-wide px-6 md:px-10" aria-hidden="true">
            <div className="h-[2px] w-full bg-ink-3/40">
              <div
                ref={barRef}
                className="h-[2px] w-full origin-left bg-gold"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
