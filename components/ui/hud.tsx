"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/components/providers/Providers";

const CHAPTERS = 6;

export function StatusChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="status-chip">
      <span className="chip-dot" aria-hidden="true" />
      {children}
    </span>
  );
}

/* Fixed Stark-HUD viewport chrome: corner brackets, side rails, bottom telemetry */
export default function Hud() {
  const reduce = useReducedMotion();
  const [seq, setSeq] = useState(1);
  const [conviction, setConviction] = useState(98.4);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setSeq(Math.min(CHAPTERS, 1 + Math.floor(p * CHAPTERS)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setConviction(+(97.6 + Math.random() * 1.8).toFixed(1));
    }, 2400);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div aria-hidden="true" className="pointer-events-none hidden lg:block">
      <span className="hud-corner hud-corner-tl" />
      <span className="hud-corner hud-corner-tr" />
      <span className="hud-corner hud-corner-bl" />
      <span className="hud-corner hud-corner-br" />

      {/* side rails */}
      <span className="hud-label fixed left-[18px] top-1/2 z-[80] origin-left -rotate-90 whitespace-nowrap">
        Satori link — live
      </span>
      <span className="hud-label fixed right-[18px] top-1/2 z-[80] flex origin-right rotate-90 items-center gap-2 whitespace-nowrap">
        <span className="inline-block h-[5px] w-[5px] rounded-full bg-crimson" />
        Conviction {conviction.toFixed(1)}%
      </span>

      {/* bottom telemetry strip */}
      <span className="hud-label fixed bottom-[18px] left-[52px] z-[80]">
        Seq 00{seq} / 00{CHAPTERS}
      </span>
      <span className="hud-label fixed bottom-[18px] left-1/2 z-[80] -translate-x-1/2">
        S.A.T.O.R.I. // Diagnostic
      </span>
      <span className="hud-label fixed bottom-[18px] right-[52px] z-[80]">
        Scroll ↓
      </span>
    </div>
  );
}
