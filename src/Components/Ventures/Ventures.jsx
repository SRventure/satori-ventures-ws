import { useRef, useState } from 'react';
import {
  m,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion';
import Container from '../Container/Container';
import Reveal from '../../motion/Reveal';

const chapters = [
  {
    n: '01',
    title: 'Web3 Infrastructure',
    body: 'Layer 1s, oracles, and the decentralized rails on which the next internet settles — the cornerstone of digital autonomy.',
    tag: 'Solana · NEAR · Aptos · Pyth Network',
  },
  {
    n: '02',
    title: 'Frontier AI',
    body: 'Foundation models, AI-native biology, and embodied robotics — intelligence as the defining technology of the decade.',
    tag: 'Reflection AI · Chai Discovery · MiniMax · DEEP Robotics',
  },
  {
    n: '03',
    title: 'Open Economies',
    body: 'DeFi, payments, and ownership networks that decentralize the gains and put economic power in more hands.',
    tag: 'Raydium · DODO · Zebec · Galxe',
  },
];

const COUNT = chapters.length;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const FADE = 0.18; // fraction of a chapter's scroll span used to fade in/out

const Chapter = ({ c, i, progress }) => {
  // seg: <0 before this chapter, 0..1 while active, >1 after
  const seg = (v) => v * COUNT - i;
  const opacity = useTransform(progress, (v) => {
    const s = seg(v);
    const fadeIn = i === 0 ? 1 : clamp01(s / FADE);
    const fadeOut = i === COUNT - 1 ? 1 : clamp01((1 - s) / FADE);
    return Math.min(fadeIn, fadeOut);
  });
  const y = useTransform(progress, (v) => {
    const s = seg(v);
    const enter = i === 0 ? 0 : (1 - clamp01(s / FADE)) * 56;
    const exit = i === COUNT - 1 ? 0 : (clamp01((s - (1 - FADE)) / FADE)) * -56;
    return enter + exit;
  });

  return (
    <m.div style={{ opacity, y }} className="absolute inset-0 flex flex-col justify-center">
      <span
        aria-hidden="true"
        className="font-dmSerifDisplay text-[#9B0801]/[0.09] text-[160px] xl:text-[210px] leading-none absolute top-0 -left-3 select-none pointer-events-none"
      >
        {c.n}
      </span>
      <h3 className="font-dmSerifDisplay text-[#441611] text-[38px] xl:text-[50px] leading-[1.1] relative">
        {c.title}
      </h3>
      <p className="font-dmSans text-[#6F5D5B] text-[17px] xl:text-[18px] leading-relaxed mt-6 max-w-[480px] relative">
        {c.body}
      </p>
      <p className="font-inter text-[12px] font-semibold uppercase tracking-[0.16em] text-[#9B0801] mt-8 relative">
        {c.tag}
      </p>
    </m.div>
  );
};

const StackedChapters = () => (
  <div className="grid md:grid-cols-3 gap-6 mt-16">
    {chapters.map((c, i) => (
      <Reveal
        key={c.title}
        delay={i * 0.12}
        className="group bg-white rounded-2xl p-8 border border-[#441611]/[0.06] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(68,22,17,0.10)]"
      >
        <p className="font-dmSerifDisplay text-[#9B0801]/25 text-[34px] leading-none mb-5">{c.n}</p>
        <h3 className="font-dmSerifDisplay text-[#441611] text-[24px] leading-tight">{c.title}</h3>
        <p className="font-dmSans text-[#6F5D5B] text-[15px] leading-relaxed mt-4">{c.body}</p>
        <p className="font-inter text-[12px] font-semibold uppercase tracking-[0.14em] text-[#9B0801] mt-6">
          {c.tag}
        </p>
      </Reveal>
    ))}
  </div>
);

const Intro = () => (
  <div className="max-w-[760px]">
    <Reveal>
      <p className="eyebrow mb-4">Our thesis</p>
      <h2 className="font-dmSerifDisplay text-[#441611] text-[34px] md:text-[42px] xl:text-[48px] leading-[1.15]">
        Web3 is the cornerstone of
        <br className="hidden md:block" /> future digital autonomy.
      </h2>
    </Reveal>
    <Reveal delay={0.15}>
      <p className="font-dmSans text-[#6F5D5B] text-[17px] leading-relaxed mt-6 max-w-[600px]">
        A foundation for economic decentralization and a crucible for innovations
        that transcend today&apos;s possibilities — a vision we cultivate in
        partnership with the companies we back.
      </p>
    </Reveal>
  </div>
);

const Ventures = () => {
  const pinRef = useRef(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ['start start', 'end end'],
  });
  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(COUNT - 1, Math.max(0, Math.floor(v * COUNT)));
    if (idx !== active) setActive(idx);
  });

  if (reduce) {
    return (
      <section className="bg-[#F6F4F2] py-24 md:py-32 border-y border-[#441611]/[0.06]">
        <Container>
          <Intro />
          <StackedChapters />
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-[#F6F4F2] border-y border-[#441611]/[0.06]">
      {/* Mobile: stacked cards */}
      <div className="md:hidden py-24">
        <Container>
          <Intro />
          <StackedChapters />
        </Container>
      </div>

      {/* Desktop: pinned scrollytelling — viewport locks while chapters scrub */}
      <div ref={pinRef} className="hidden md:block h-[300vh]">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <Container className="w-full">
            <div className="grid md:grid-cols-[1fr_1.1fr] gap-x-16 items-center w-full">
              <div>
                <Intro />
                <div className="flex items-center gap-5 mt-12">
                  <div className="relative w-[2px] h-24 bg-[#441611]/10 rounded-full overflow-hidden">
                    <m.div
                      className="absolute inset-0 bg-[#9B0801] origin-top"
                      style={{ scaleY: railScale }}
                    />
                  </div>
                  <ul className="space-y-3 list-none p-0 m-0">
                    {chapters.map((c, i) => (
                      <li
                        key={c.n}
                        className={`font-inter text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${
                          i === active ? 'text-[#9B0801]' : 'text-[#441611]/35'
                        }`}
                      >
                        {c.n} — {c.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="relative h-[440px]">
                {chapters.map((c, i) => (
                  <Chapter key={c.n} c={c} i={i} progress={scrollYProgress} />
                ))}
              </div>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
};

export default Ventures;
