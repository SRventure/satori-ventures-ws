"use client";

import { TextReveal } from "@/components/ui/text-reveal";
import Scramble from "@/components/Scramble";

const QUOTE =
  "Where ideas ignite, innovation takes flight — we champion the creators, share ownership, and decentralize the gains.";

export default function Manifesto() {
  return (
    <section id="manifesto" className="relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute left-[6%] top-[12%] h-[440px] w-[440px] rounded-full opacity-[0.10]"
          style={{ background: "radial-gradient(circle, rgb(var(--accent-gold)) 0%, transparent 62%)" }}
        />
        <div
          className="absolute right-[4%] top-[55%] h-[520px] w-[520px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, rgb(var(--accent-red)) 0%, transparent 62%)" }}
        />
      </div>

      <div className="relative">
        <p className="eyebrow eyebrow-tick absolute left-6 top-[14vh] z-10 md:left-10">
          <Scramble text="01 / Our Philosophy" />
        </p>
        <TextReveal highlights={["ignite", "creators", "decentralize"]}>{QUOTE}</TextReveal>
      </div>

      <div className="mx-auto grid w-full max-w-wide gap-8 px-6 pb-28 md:grid-cols-2 md:gap-16 md:px-10">
        <p className="max-w-[520px] font-sans text-[17px] leading-relaxed text-ink">
          We invest in the potential of tomorrow, employing a keen, eagle-eyed
          approach to pinpoint opportunities that redefine what&apos;s possible —
          across Web3, blockchain infrastructure, and frontier AI.
        </p>
        <p className="max-w-[520px] font-sans text-[17px] leading-relaxed text-ink">
          Our global perspective, fortified by a robust Asian market presence,
          ensures our partners are poised for international influence and success.
        </p>
      </div>
    </section>
  );
}
