"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import Magnetic from "@/components/Magnetic";
import { useReducedMotion } from "@/components/providers/Providers";

const ParticleField = dynamic(() => import("./ParticleField"), { ssr: false });

function RevealLine({
  text,
  delay,
  className,
}: {
  text: string;
  delay: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <span className={`block overflow-hidden ${className ?? ""}`}>
      <span className="inline-block" aria-hidden="true">
        {text.split("").map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={reduce ? false : { y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
              delay: delay + i * 0.03,
            }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </span>
    </span>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce]);

  return (
    <section
      ref={ref}
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <ParticleField />

      {/* mouse glow */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[1] h-[560px] w-[560px] rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgb(var(--accent-gold) / 0.07) 0%, transparent 65%)",
        }}
      />

      <motion.div
        style={reduce ? undefined : { y: textY, opacity: fade }}
        className="relative z-[2] mx-auto w-full max-w-wide px-6 md:px-10"
      >
        <motion.p
          className="eyebrow mb-8"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
        >
          Venture Capital &middot; Web3 &middot; Blockchain &middot; AI
        </motion.p>

        <h1
          className="font-serif text-ink text-[13vw] leading-[1.02] sm:text-[80px] lg:text-[104px] xl:text-[118px]"
          aria-label="Fostering the Blockchain Renaissance"
        >
          <RevealLine text="Fostering the" delay={0.25} />
          <RevealLine text="Blockchain" delay={0.6} className="text-gold italic" />
          <RevealLine text="Renaissance" delay={0.95} />
        </h1>

        <motion.p
          className="mt-8 max-w-[460px] font-sans text-[16px] font-light leading-relaxed text-ink-2 md:text-[18px]"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 1.35 }}
        >
          We back founders building the transformative layer of the internet —
          across Web3, blockchain infrastructure, and frontier AI.
        </motion.p>

        <motion.div
          className="mt-11 flex flex-wrap items-center gap-5"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 1.55 }}
        >
          <Magnetic>
            <a
              href="#portfolio"
              className="group inline-flex items-center gap-2 border border-gold bg-gold/10 px-9 py-4 font-sans text-[14px] font-medium uppercase tracking-[0.18em] text-gold transition-colors duration-300 hover:bg-gold hover:text-bg"
            >
              View Portfolio
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Magnetic>
          <Magnetic strength={0.25}>
            <a
              href="#contact"
              className="nav-link font-sans text-[14px] font-medium uppercase tracking-[0.18em] text-ink-2 transition-colors duration-300 hover:text-ink"
            >
              Get in touch
            </a>
          </Magnetic>
        </motion.div>

        <motion.p
          className="mt-14 font-sans text-[13px] tracking-wide text-ink-2/80"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.9 }}
        >
          <span className="font-semibold text-gold">128+</span> investments since 2022
          <span className="mx-3 text-ink-3">|</span>
          Global reach, rooted in Asia
        </motion.p>
      </motion.div>

      {/* scroll indicator */}
      <div
        aria-hidden="true"
        className={`absolute bottom-8 left-1/2 z-[2] -translate-x-1/2 transition-opacity duration-700 ${
          scrolled ? "opacity-0" : "opacity-100"
        }`}
      >
        <ChevronDown className="chevron-pulse h-6 w-6 text-gold/80" />
      </div>
    </section>
  );
}
