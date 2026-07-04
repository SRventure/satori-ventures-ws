"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/components/providers/Providers";

/* Depth layer: moves at `speed` relative to scroll (0.2 slow bg … 0.8 near fg) */
export function Parallax({
  speed = 0.3,
  className = "",
  style,
  children,
  "aria-hidden": ariaHidden,
}: {
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  "aria-hidden"?: boolean | "true" | "false";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed * 160, speed * -160]);

  return (
    <motion.div
      ref={ref}
      aria-hidden={ariaHidden}
      className={className}
      style={reduce ? style : { ...style, y }}
    >
      {children}
    </motion.div>
  );
}
