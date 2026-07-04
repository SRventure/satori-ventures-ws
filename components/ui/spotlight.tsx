"use client";

// Adapted from 21st.dev @aceternity/spotlight-new — re-tinted gold/crimson.
import React from "react";
import { motion } from "framer-motion";

type SpotlightProps = {
  translateY?: number;
  width?: number;
  height?: number;
  smallWidth?: number;
  duration?: number;
  xOffset?: number;
};

const g1 =
  "radial-gradient(68.54% 68.72% at 55.02% 31.46%, rgb(var(--accent-gold) / 0.10) 0, rgb(var(--accent-gold) / 0.03) 50%, transparent 80%)";
const g2 =
  "radial-gradient(50% 50% at 50% 50%, rgb(var(--accent-gold) / 0.07) 0, rgb(var(--accent-red) / 0.03) 80%, transparent 100%)";
const g3 =
  "radial-gradient(50% 50% at 50% 50%, rgb(var(--accent-red) / 0.05) 0, rgb(var(--accent-red) / 0.02) 80%, transparent 100%)";

export const Spotlight = ({
  translateY = -350,
  width = 560,
  height = 1380,
  smallWidth = 240,
  duration = 7,
  xOffset = 100,
}: SpotlightProps = {}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
    >
      <motion.div
        animate={{ x: [0, xOffset, 0] }}
        transition={{ duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="pointer-events-none absolute left-0 top-0 h-screen w-screen"
      >
        <div
          style={{ transform: `translateY(${translateY}px) rotate(-45deg)`, background: g1, width, height }}
          className="absolute left-0 top-0"
        />
        <div
          style={{ transform: "rotate(-45deg) translate(5%, -50%)", background: g2, width: smallWidth, height }}
          className="absolute left-0 top-0 origin-top-left"
        />
        <div
          style={{ transform: "rotate(-45deg) translate(-180%, -70%)", background: g3, width: smallWidth, height }}
          className="absolute left-0 top-0 origin-top-left"
        />
      </motion.div>
      <motion.div
        animate={{ x: [0, -xOffset, 0] }}
        transition={{ duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="pointer-events-none absolute right-0 top-0 h-screen w-screen"
      >
        <div
          style={{ transform: `translateY(${translateY}px) rotate(45deg)`, background: g1, width, height }}
          className="absolute right-0 top-0"
        />
        <div
          style={{ transform: "rotate(45deg) translate(-5%, -50%)", background: g2, width: smallWidth, height }}
          className="absolute right-0 top-0 origin-top-right"
        />
        <div
          style={{ transform: "rotate(45deg) translate(180%, -70%)", background: g3, width: smallWidth, height }}
          className="absolute right-0 top-0 origin-top-right"
        />
      </motion.div>
    </motion.div>
  );
};
