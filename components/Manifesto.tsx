"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/components/providers/Providers";

const QUOTE =
  "Where ideas ignite, innovation takes flight — we champion the creators, share ownership, and decentralize the gains.";

export default function Manifesto() {
  const outerRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const outer = outerRef.current;
    const quote = quoteRef.current;
    if (!outer || !quote) return;

    gsap.registerPlugin(ScrollTrigger);
    const words = quote.querySelectorAll("span[data-w]");
    const layers = outer.querySelectorAll("[data-layer]");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.08, y: 26 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: outer,
            start: "top top",
            end: "55% bottom",
            scrub: 0.6,
          },
        }
      );

      layers.forEach((el) => {
        const speed = parseFloat((el as HTMLElement).dataset.layer || "1");
        gsap.fromTo(
          el,
          { yPercent: 30 * speed },
          {
            yPercent: -30 * speed,
            ease: "none",
            scrollTrigger: {
              trigger: outer,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    }, outer);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <section ref={outerRef} id="manifesto" className="relative h-[260vh]">
      {/* parallax depth layers */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          data-layer="0.3"
          className="absolute left-[8%] top-[16%] h-[440px] w-[440px] rounded-full opacity-[0.10]"
          style={{ background: "radial-gradient(circle, rgb(var(--accent-gold)) 0%, transparent 62%)" }}
        />
        <div
          data-layer="0.6"
          className="absolute right-[4%] top-[42%] h-[560px] w-[560px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, rgb(var(--accent-cyan)) 0%, transparent 62%)" }}
        />
        <div
          data-layer="1"
          className="absolute left-[38%] top-[68%] h-[380px] w-[380px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(circle, rgb(var(--accent-gold)) 0%, transparent 62%)" }}
        />
      </div>

      <div className="sticky top-0 flex h-screen items-center">
        <div className="mx-auto w-full max-w-wide px-6 md:px-10">
          <p className="eyebrow mb-10">Our Philosophy</p>
          <p
            ref={quoteRef}
            className="max-w-[1120px] font-serif text-[clamp(34px,6.4vw,96px)] leading-[1.14] text-ink"
          >
            {QUOTE.split(" ").map((w, i) => (
              <span key={i} data-w className="inline-block whitespace-pre">
                {w}{" "}
              </span>
            ))}
          </p>

          <div className="mt-14 grid gap-8 md:grid-cols-2 md:gap-16">
            <p className="max-w-[480px] font-sans text-[16px] font-light leading-relaxed text-ink-2">
              We invest in the potential of tomorrow, employing a keen, eagle-eyed
              approach to pinpoint opportunities that redefine what&apos;s possible —
              across Web3, blockchain infrastructure, and frontier AI.
            </p>
            <p className="max-w-[480px] font-sans text-[16px] font-light leading-relaxed text-ink-2">
              Our global perspective, fortified by a robust Asian market presence,
              ensures our partners are poised for international influence and success.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
