"use client";

// Adapted from 21st.dev @magicui/text-reveal — scroll-scrubbed word reveal,
// restyled to the Satori token system (bold display type, high contrast).
import { useRef, type FC, type ReactNode } from "react";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TextRevealProps {
  children: string;
  className?: string;
  /** words rendered in gold */
  highlights?: string[];
}

export const TextReveal: FC<TextRevealProps> = ({
  children,
  className,
  highlights = [],
}) => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef });
  const words = children.split(" ");

  return (
    <div ref={sectionRef} className={cn("relative z-0 h-[220vh]", className)}>
      <div className="sticky top-0 mx-auto flex h-screen max-w-wide items-center px-6 md:px-10">
        <span className="flex flex-wrap font-display text-[clamp(28px,5vw,64px)] font-bold uppercase leading-[1.12] tracking-[-0.01em]">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            const hl = highlights.some(
              (h) => h.toLowerCase() === word.toLowerCase().replace(/[^a-z0-9]/gi, "")
            );
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]} highlight={hl}>
                {word}
              </Word>
            );
          })}
        </span>
      </div>
    </div>
  );
};

const Word: FC<{
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
  highlight?: boolean;
}> = ({ children, progress, range, highlight }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative mx-[0.32em] my-[0.06em]">
      <span className="absolute opacity-[0.12]" aria-hidden="true">
        {children}
      </span>
      <motion.span style={{ opacity }} className={highlight ? "text-gold" : "text-ink"}>
        {children}
      </motion.span>
    </span>
  );
};
