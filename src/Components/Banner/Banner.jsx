import { useRef } from 'react';
import { m, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { MdArrowOutward } from 'react-icons/md';
import Container from '../Container/Container';
import Globe from '../GlobeComponent/Globe';
import Magnetic from '../../motion/Magnetic';
import { anchorHandler } from '../../motion/scrollTo';
import { EASE } from '../../motion/tokens';

// Transform-only entrances: hero text is pre-painted by the static shell in
// index.html, so it must never pass through an opacity-0 state.
const lineReveal = {
  hidden: { y: 44 },
  visible: (i) => ({
    y: 0,
    transition: { duration: 0.9, ease: EASE, delay: 0.08 + i * 0.1 },
  }),
};

const Banner = () => {
  const sectionRef = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const globeY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 48]);

  const HeadLine = ({ i, children }) => (
    <m.span
      className="block"
      custom={i}
      initial={reduce ? false : 'hidden'}
      animate="visible"
      variants={lineReveal}
    >
      {children}
    </m.span>
  );

  return (
    <section ref={sectionRef} id="home" className="relative overflow-hidden">
      {/* faint red wash behind the globe */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-20%] top-[-10%] h-[720px] w-[720px] rounded-full opacity-[0.05]"
        style={{ background: 'radial-gradient(circle, #9B0801 0%, transparent 62%)' }}
      />

      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-y-12 pt-14 md:pt-20 pb-20 md:pb-28">
          <m.div className="md:w-1/2" style={reduce ? undefined : { y: textY }}>
            <m.p
              className="eyebrow mb-5"
              initial={reduce ? false : { y: 14 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
            >
              Venture Capital · Web3 · Blockchain · AI
            </m.p>

            <h1 className="font-dmSerifDisplay text-[#441611] text-[44px] leading-[1.08] md:text-[64px] xl:text-[72px]">
              <HeadLine i={0}>Fostering</HeadLine>
              <HeadLine i={1}>
                the <span className="text-[#9B0801]">Blockchain</span>
              </HeadLine>
              <HeadLine i={2}>Renaissance</HeadLine>
            </h1>

            {/* transform-only animation: this is the LCP text, keep it painted */}
            <m.p
              className="font-dmSans text-[#6F5D5B] text-[17px] md:text-[18px] leading-relaxed max-w-[420px] mt-6"
              initial={reduce ? false : { y: 24 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
            >
              We back founders building the transformative layer of the internet —
              across Web3, blockchain infrastructure, and frontier AI.
            </m.p>

            <m.div
              className="flex flex-wrap items-center gap-4 mt-9"
              initial={reduce ? false : { y: 24 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
            >
              <Magnetic strength={0.24}>
                <a
                  href="#portfolio"
                  onClick={anchorHandler('portfolio', -96)}
                  className="group inline-flex items-center gap-2 bg-[#9B0801] hover:bg-[#7d0701] text-white text-[16px] font-dmSans font-semibold px-8 py-3.5 rounded-full transition-colors duration-200"
                >
                  <span>View Portfolio</span>
                  <MdArrowOutward className="text-[18px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </Magnetic>
              <Magnetic strength={0.18}>
                <a
                  href="#contact"
                  onClick={anchorHandler('contact', -40)}
                  className="inline-flex items-center text-[#441611] text-[16px] font-dmSans font-semibold border border-[#441611]/15 hover:border-[#441611]/30 hover:bg-[#F6F4F2] px-8 py-3.5 rounded-full transition-all duration-200"
                >
                  Get in touch
                </a>
              </Magnetic>
            </m.div>

            <m.p
              className="font-inter text-[13px] text-[#6F5D5B]/80 tracking-wide mt-10"
              initial={reduce ? false : { y: 16 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.65 }}
            >
              <span className="text-[#9B0801] font-semibold">128+</span> investments since 2022
              <span className="mx-3 text-[#441611]/20">|</span>
              Global reach, rooted in Asia
            </m.p>

            <m.div
              className="hidden md:flex items-center gap-3 mt-12"
              initial={reduce ? false : { y: 12 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.8 }}
              aria-hidden="true"
            >
              <span className="scroll-cue-track">
                <span className="scroll-cue-dash" />
              </span>
              <span className="font-inter text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6F5D5B]/70">
                Scroll to explore
              </span>
            </m.div>
          </m.div>

          <m.div className="md:w-1/2" style={reduce ? undefined : { y: globeY }}>
            <Globe />
          </m.div>
        </div>
      </Container>
    </section>
  );
};

export default Banner;
