"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import Magnetic from "@/components/Magnetic";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";
import { FlipWords } from "@/components/ui/flip-words";
import { Spotlight } from "@/components/ui/spotlight";
import { useReducedMotion } from "@/components/providers/Providers";
import { StatusChip } from "@/components/ui/hud";

const ParticleField = dynamic(() => import("./ParticleField"), { ssr: false });
const MouseGlow = dynamic(() => import("./MouseGlow"), { ssr: false });

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [ready, setReady] = useState(false);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // section is 160svh; the inner 100svh block is sticky, so the hero stays
  // pinned ~60svh of scroll while text fades and the field scales up
  const textY = useTransform(scrollYProgress, [0, 0.45], [0, 90]);
  const fade = useTransform(scrollYProgress, [0.02, 0.38], [1, 0]);
  const fieldScale = useTransform(scrollYProgress, [0, 1], [1, 1.22]);
  const fieldFade = useTransform(scrollYProgress, [0, 0.6], [1, 0.12]);

  useEffect(() => {
    if (document.documentElement.getAttribute("data-loaded") !== "false") {
      setReady(true);
      return;
    }
    const on = () => setReady(true);
    window.addEventListener("satori:loaded", on);
    return () => window.removeEventListener("satori:loaded", on);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const enter = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: reduce || ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.8, ease: "easeOut" as const, delay },
  });

  return (
    <section ref={ref} id="home" className={`relative ${reduce ? "" : "h-[160svh]"}`}>
      <div className="sticky top-0 flex min-h-[100svh] items-end overflow-hidden pb-24 pt-[120px] md:items-center md:pb-0 md:pt-0">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={reduce ? undefined : { scale: fieldScale, opacity: fieldFade }}
      >
        <ParticleField />
      </motion.div>
      {!reduce && <Spotlight />}
      <MouseGlow />

      <motion.div
        style={reduce ? undefined : { y: textY, opacity: fade }}
        className="relative z-[2] mx-auto grid w-full max-w-wide grid-cols-1 gap-10 px-6 md:grid-cols-[1.5fr_1fr] md:items-center md:gap-16 md:px-10"
      >
        <div>
          <motion.div className="mb-8" {...enter(0.15)}>
            <StatusChip>Satori Ventures // Est. 2022 // Online</StatusChip>
          </motion.div>

          <h1 className="display-xl !normal-case text-[clamp(48px,9.8vw,136px)] !leading-[0.95]">
            {ready || reduce ? (
              <>
                <span className="block">
                  <VerticalCutReveal delay={0.2}>This isn't</VerticalCutReveal>
                </span>
                <span className="block text-gold">
                  <VerticalCutReveal delay={0.45}>just capital.</VerticalCutReveal>
                </span>
              </>
            ) : (
              <span className="opacity-0">This isn't just capital.</span>
            )}
          </h1>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 font-display text-[17px] font-semibold uppercase tracking-[0.08em] text-ink md:text-[21px]"
            {...enter(1.0)}
          >
            <span className="text-ink-2">We back</span>
            <span className="relative inline-flex min-w-[240px] text-crimson md:min-w-[330px]">
              <FlipWords
                words={["FRONTIER AI", "WEB3 RAILS", "OPEN ECONOMIES", "THE RENAISSANCE"]}
                duration={2600}
              />
            </span>
          </motion.div>

          <motion.div className="mt-10 flex flex-wrap items-center gap-5" {...enter(1.25)}>
            <Magnetic>
              <a
                href="#portfolio"
                className="group inline-flex items-center gap-2 bg-gold px-9 py-4 font-display text-[14px] font-bold uppercase tracking-[0.14em] text-black transition-colors duration-300 hover:bg-crimson hover:text-white"
              >
                View Portfolio
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Magnetic>
            <Magnetic strength={0.25}>
              <a
                href="#contact"
                className="pill-cta text-ink transition-colors duration-300 hover:text-gold"
              >
                Get in touch
                <span className="pill-plus text-gold">+</span>
              </a>
            </Magnetic>
          </motion.div>
        </div>

        {/* Stark-style glass quote card */}
        <motion.aside className="glass-card hidden max-w-[330px] p-7 md:block" {...enter(1.4)}>
          <p className="font-sans text-[15px] leading-relaxed text-ink">
            &ldquo;Satori isn&apos;t just a fund. It&apos;s the result of
            unprecedented conviction in the internet&apos;s next
            layer.&rdquo;
          </p>
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
            Satori Ventures — Est. 2022
          </p>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">
            128+ investments // Rooted in Asia
          </p>
        </motion.aside>
      </motion.div>

      {/* scroll to continue */}
      <div
        aria-hidden="true"
        className={`absolute bottom-7 left-1/2 z-[2] -translate-x-1/2 transition-opacity duration-700 ${
          scrolled ? "opacity-0" : "opacity-100"
        }`}
      >
        <span className="scroll-continue">
          <ChevronDown className="chevron-pulse h-4 w-4 text-gold" />
          Scroll to continue
        </span>
      </div>
      </div>
    </section>
  );
}
