"use client";

// Adapted from 21st.dev @magicui/border-beam — rewritten for Tailwind 3
// (original used v4 arbitrary mask/border syntax; masks are inlined here).
import { motion, type Transition } from "framer-motion";

interface BorderBeamProps {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  transition?: Transition;
  reverse?: boolean;
  borderWidth?: number;
}

export const BorderBeam = ({
  size = 60,
  delay = 0,
  duration = 5,
  colorFrom = "rgb(var(--accent-gold))",
  colorTo = "rgb(var(--accent-red))",
  transition,
  reverse = false,
  borderWidth = 1.5,
}: BorderBeamProps) => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-transparent"
      style={{
        borderWidth,
        borderStyle: "solid",
        maskImage:
          "linear-gradient(transparent, transparent), linear-gradient(#000, #000)",
        maskClip: "padding-box, border-box",
        maskComposite: "intersect",
        WebkitMaskImage:
          "linear-gradient(transparent, transparent), linear-gradient(#000, #000)",
        WebkitMaskClip: "padding-box, border-box",
        WebkitMaskComposite: "source-in",
      }}
    >
      <motion.div
        className="absolute aspect-square"
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
        }}
        initial={{ offsetDistance: "0%" }}
        animate={{
          offsetDistance: reverse ? ["100%", "0%"] : ["0%", "100%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
          ...transition,
        }}
      />
    </div>
  );
};
