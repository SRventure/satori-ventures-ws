"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import VerticalCutReveal from "@/components/ui/vertical-cut-reveal";

export default function Conviction() {
  return (
    <AuroraBackground className="hairline-t hairline-b">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-wide flex-col items-center justify-center px-6 py-28 text-center md:px-10">
        <motion.p
          className="font-display text-[13px] font-bold uppercase tracking-[0.3em] text-crimson"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          Satori-1 · Investment Engine
        </motion.p>

        <h2 className="display-xl mt-6 text-[clamp(40px,7.6vw,104px)]">
          <span className="block">
            <VerticalCutReveal staggerDuration={0.03}>POWERED BY</VerticalCutReveal>
          </span>
          <span className="block">
            <VerticalCutReveal staggerDuration={0.03} delay={0.3}>
              CONVICTION
            </VerticalCutReveal>
            <span className="align-super text-[0.4em] text-crimson">*</span>
          </span>
        </h2>

        <motion.p
          className="mt-9 max-w-[560px] font-sans text-[17px] leading-relaxed text-ink md:text-[19px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          No index bets. No spray-and-pray. Every position is a thesis about
          where the internet&apos;s next layer is being built — and who is
          building it.
        </motion.p>

        <motion.p
          className="annotation mt-12 max-w-[340px] text-ink-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          *Conviction fills in the gaps. We said seed. It heard series&nbsp;A.
        </motion.p>

        <span className="scroll-continue absolute bottom-8 left-1/2 -translate-x-1/2" aria-hidden="true">
          <ChevronDown className="chevron-pulse h-4 w-4 text-gold" />
          Scroll to continue
        </span>
      </div>
    </AuroraBackground>
  );
}
