"use client";

// Adapted (condensed) from 21st.dev @danielpetho/vertical-cut-reveal —
// per-character slide-up reveal inside clipped lines, triggered in view.
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/components/providers/Providers";

export default function VerticalCutReveal({
  children,
  className,
  staggerDuration = 0.025,
  delay = 0,
  once = true,
}: {
  children: string;
  className?: string;
  staggerDuration?: number;
  delay?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  const reduce = useReducedMotion();
  const words = children.split(" ");
  let charIndex = 0;

  if (reduce) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span ref={ref} className={cn("inline", className)} aria-label={children}>
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap" aria-hidden="true">
          {word.split("").map((ch, ci) => {
            const idx = charIndex++;
            return (
              <span key={ci} className="inline-block overflow-hidden align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%" }}
                  animate={inView ? { y: 0 } : { y: "110%" }}
                  transition={{
                    type: "spring",
                    stiffness: 190,
                    damping: 22,
                    delay: delay + idx * staggerDuration,
                  }}
                >
                  {ch}
                </motion.span>
              </span>
            );
          })}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
