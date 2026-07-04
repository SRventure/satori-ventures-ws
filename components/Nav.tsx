"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/components/providers/Providers";

const LINKS = [
  { href: "#manifesto", label: "Manifesto" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#focus", label: "Focus" },
  { href: "#contact", label: "Contact" },
];

function scrollToAnchor(e: React.MouseEvent, href: string) {
  e.preventDefault();
  const el = document.querySelector(href);
  if (!el) return;
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -72 });
  else (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
}

export default function Nav() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-ink-3/25" : "border-b border-transparent"
      }`}
      style={{
        background: scrolled ? "var(--glass)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <nav className="mx-auto flex h-[72px] w-full max-w-wide items-center justify-between px-6 md:px-10">
        <a
          href="#home"
          onClick={(e) => scrollToAnchor(e, "#home")}
          className="group flex items-center gap-3"
          aria-label="Satori Ventures — home"
        >
          <Image
            src="/satorl_logo.png"
            alt=""
            width={30}
            height={35}
            className="company-logo transition-opacity duration-300 group-hover:opacity-80"
            priority
          />
          <span className="font-display text-[17px] font-bold uppercase tracking-[0.08em] text-ink transition-colors duration-300 group-hover:text-gold">
            Satori<span className="text-crimson">.</span>Ventures
          </span>
        </a>

        <div className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => scrollToAnchor(e, l.href)}
              className="nav-link font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-2 transition-colors duration-300 hover:text-ink"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-3/50 text-ink-2 transition-all duration-300 hover:border-gold hover:text-gold"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-3/50 text-ink-2"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center text-ink"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-bg md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex h-[72px] items-center justify-between px-6">
              <span className="font-display text-[17px] font-bold uppercase tracking-[0.08em] text-ink">
                Satori<span className="text-crimson">.</span>Ventures
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <span
              aria-hidden="true"
              className="text-stroke-ink pointer-events-none absolute bottom-4 left-0 select-none font-display text-[24vw] font-black uppercase leading-none opacity-40"
            >
              SATORI
            </span>
            <div className="relative flex flex-1 flex-col items-start justify-center gap-2 px-8">
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => {
                    scrollToAnchor(e, l.href);
                    setOpen(false);
                  }}
                  className="group flex items-baseline gap-4 py-3 font-display text-[38px] font-black uppercase tracking-[-0.01em] text-ink transition-colors hover:text-gold"
                  initial={{ y: 36, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.08 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="font-display text-[12px] font-bold tracking-[0.2em] text-crimson">
                    0{i + 1}
                  </span>
                  {l.label}
                </motion.a>
              ))}
              <motion.p
                className="eyebrow mt-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                contact@srventures.io
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
