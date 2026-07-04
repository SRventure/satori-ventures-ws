"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const R = 17;
  const C = 2 * Math.PI * R;

  return (
    <footer className="border-t border-ink-3/25">
      <div className="mx-auto flex w-full max-w-wide flex-col items-start justify-between gap-10 px-6 py-14 md:flex-row md:items-center md:px-10">
        <div className="flex items-center gap-3">
          <Image src="/satorl_logo.png" alt="" width={26} height={30} className="company-logo" />
          <span className="font-serif text-[17px] text-ink">
            Satori<span className="text-crimson">.</span>Ventures
          </span>
        </div>

        <p className="font-sans text-[13px] font-light text-ink-2">
          © {new Date().getFullYear()} Satori Ventures — Fostering the Blockchain Renaissance
        </p>

        <div className="flex items-center gap-6">
          <a
            href="mailto:contact@srventures.io"
            className="nav-link font-sans text-[13px] text-ink-2 transition-colors hover:text-ink"
          >
            contact@srventures.io
          </a>
          <button
            onClick={toTop}
            aria-label="Back to top"
            className="group relative flex h-11 w-11 items-center justify-center"
          >
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r={R} fill="none" stroke="rgb(var(--text-muted) / 0.4)" strokeWidth="1.5" />
              <circle
                cx="20"
                cy="20"
                r={R}
                fill="none"
                stroke="rgb(var(--accent-gold))"
                strokeWidth="1.5"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - progress)}
                strokeLinecap="round"
              />
            </svg>
            <ArrowUp className="h-4 w-4 text-ink-2 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-gold" />
          </button>
        </div>
      </div>
    </footer>
  );
}
