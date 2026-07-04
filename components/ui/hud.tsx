"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/providers/Providers";

const DECODE_CHARS = "ABCDEFGHKMNPRSTUVWXYZ0123456789";

const SECTION_NAMES: Record<string, string> = {
  manifesto: "Manifesto",
  portfolio: "Portfolio",
  contact: "Engagement",
};

function nameFor(el: Element): string {
  const id = el.getAttribute("id") ?? "";
  if (SECTION_NAMES[id]) return SECTION_NAMES[id];
  const aria = el.getAttribute("aria-label") ?? "";
  if (/thesis/i.test(aria)) return "Thesis";
  if (/constellation/i.test(aria)) return "The System";
  if (id) return id;
  return "";
}

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
  const [pct, setPct] = useState(0);
  const [conviction, setConviction] = useState(98.4);
  const [section, setSection] = useState("Uplink");
  const [display, setDisplay] = useState("Uplink");
  const [clock, setClock] = useState("--:--:--");
  const [blurred, setBlurred] = useState(false);
  const decodeRaf = useRef(0);
  const lastY = useRef(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* scroll percentage + motion blur on rapid scroll */
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setPct(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0);
        if (!reduce) {
          const dy = Math.abs(window.scrollY - lastY.current);
          lastY.current = window.scrollY;
          if (dy > 90) {
            setBlurred(true);
            if (blurTimer.current) clearTimeout(blurTimer.current);
            blurTimer.current = setTimeout(() => setBlurred(false), 220);
          }
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  /* current-section detection */
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll("main section"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const n = nameFor(e.target);
            if (n) setSection(n);
          }
        }
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  /* decode cross-fade when section changes */
  useEffect(() => {
    if (reduce) {
      setDisplay(section);
      return;
    }
    const t0 = performance.now();
    const DUR = 220;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / DUR, 1);
      const locked = Math.floor(p * section.length);
      setDisplay(
        section
          .split("")
          .map((c, i) =>
            i < locked || c === " "
              ? c
              : DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)]
          )
          .join("")
      );
      if (p < 1) decodeRaf.current = requestAnimationFrame(tick);
      else setDisplay(section);
    };
    decodeRaf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(decodeRaf.current);
  }, [section, reduce]);

  /* live local clock */
  useEffect(() => {
    const update = () =>
      setClock(
        new Date().toLocaleTimeString("en-GB", { hour12: false })
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  /* conviction ticker */
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setConviction(+(97.6 + Math.random() * 1.8).toFixed(1));
    }, 2400);
    return () => clearInterval(id);
  }, [reduce]);

  const blurStyle = {
    filter: blurred ? "blur(2px)" : "blur(0px)",
    transition: "filter 0.18s ease",
  };

  return (
    <div aria-hidden="true" className="pointer-events-none hidden lg:block" style={blurStyle}>
      <span className="hud-corner hud-corner-tl" />
      <span className="hud-corner hud-corner-tr" />
      <span className="hud-corner hud-corner-bl" />
      <span className="hud-corner hud-corner-br" />

      {/* side rails */}
      <span className="hud-label fixed left-[18px] top-1/2 z-[80] origin-left -rotate-90 whitespace-nowrap">
        Sector // <span className="text-gold">{display}</span>
      </span>
      <span className="hud-label fixed right-[18px] top-1/2 z-[80] flex origin-right rotate-90 items-center gap-2 whitespace-nowrap">
        <span className="inline-block h-[5px] w-[5px] rounded-full bg-crimson" />
        Conviction {conviction.toFixed(1)}%
      </span>

      {/* bottom telemetry strip */}
      <span className="hud-label fixed bottom-[18px] left-[52px] z-[80]">
        Satori.Ventures // v2.0
      </span>
      <span className="hud-label fixed bottom-[18px] left-1/2 z-[80] -translate-x-1/2 tabular-nums">
        S.A.T.O.R.I. // {String(pct).padStart(3, "0")}%
      </span>
      <span className="hud-label fixed bottom-[18px] right-[52px] z-[80] tabular-nums">
        {clock}
      </span>
    </div>
  );
}
