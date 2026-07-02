import { useRef } from 'react';
import { m, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { MdArrowOutward } from 'react-icons/md';
import Container from '../Container/Container';
import Reveal from '../../motion/Reveal';
import Magnetic from '../../motion/Magnetic';
import { anchorHandler } from '../../motion/scrollTo';

const ClosingCta = () => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const bgX = useTransform(scrollYProgress, [0, 1], ['4%', '-10%']);

  return (
    <section ref={ref} className="relative bg-[#441611] py-28 md:py-40 overflow-hidden">
      {/* faint red glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-15%] bottom-[-40%] h-[640px] w-[640px] rounded-full opacity-[0.22]"
        style={{ background: 'radial-gradient(circle, #9B0801 0%, transparent 65%)' }}
      />

      {/* kinetic outlined backdrop word */}
      <m.div
        aria-hidden="true"
        style={reduce ? undefined : { x: bgX }}
        className="pointer-events-none select-none absolute top-1/2 -translate-y-1/2 left-0 whitespace-nowrap font-dmSerifDisplay type-outline-light leading-none text-[180px] md:text-[300px] xl:text-[380px]"
      >
        Satori Satori Satori
      </m.div>

      <Container className="relative">
        <div className="max-w-[880px]">
          <Reveal>
            <p className="font-inter text-[12px] font-semibold uppercase tracking-[0.22em] text-[#E8A69F] mb-6">
              Work with us
            </p>
            <h2 className="font-dmSerifDisplay text-[#FAF8F7] text-[42px] md:text-[64px] xl:text-[76px] leading-[1.06]">
              Bring us your
              <br />
              <span className="italic text-[#E8A69F]">next venture.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="font-dmSans text-[#FAF8F7]/70 text-[17px] md:text-[18px] leading-relaxed mt-8 max-w-[520px]">
              If you&apos;re building the transformative layer of the internet,
              we want to be your first believer.
            </p>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="flex flex-wrap items-center gap-6 mt-10">
              <Magnetic strength={0.24}>
                <a
                  href="#contact"
                  onClick={anchorHandler('contact', -40)}
                  className="group inline-flex items-center gap-2 bg-[#FAF8F7] hover:bg-white text-[#441611] text-[16px] font-dmSans font-semibold px-9 py-4 rounded-full transition-colors duration-200"
                >
                  <span>Start the conversation</span>
                  <MdArrowOutward className="text-[18px] text-[#9B0801] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </Magnetic>
              <a
                href="mailto:otc@satoriresearch.io"
                className="font-dmSans text-[#FAF8F7]/80 hover:text-[#FAF8F7] text-[16px] font-semibold underline-offset-4 hover:underline transition-colors duration-200"
              >
                otc@satoriresearch.io
              </a>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
};

export default ClosingCta;
