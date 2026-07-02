import { useState } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { companies } from '../../data/data';
import Container from '../Container/Container';
import Reveal from '../../motion/Reveal';
import Marquee from '../../motion/Marquee';
import { EASE } from '../../motion/tokens';

const Portfolio = () => {
  const [showMore, setShowMore] = useState(false);
  const reduce = useReducedMotion();
  const visible = showMore ? companies : companies.slice(0, 10);

  return (
    <section id="portfolio" className="py-24 md:py-32">
      <div className="text-center">
        <Container>
          <Reveal>
            <p className="eyebrow mb-4">Portfolio</p>
            <h2 className="font-dmSerifDisplay text-[#441611] text-[36px] md:text-[44px] xl:text-[50px] leading-[1.12]">
              The companies defining tomorrow
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="font-dmSans text-[#6F5D5B] text-[17px] leading-relaxed max-w-[560px] mx-auto mt-5">
              From frontier AI labs to the infrastructure of Web3 — 26 of the
              128+ companies we&apos;ve backed since 2022.
            </p>
          </Reveal>
        </Container>
      </div>

      {/* Logo marquee */}
      <Reveal delay={0.2} y={0} className="mt-14">
        <Marquee speed={44}>
          {companies.map((c) => (
            <img
              key={c.name}
              src={c.logo}
              alt=""
              loading="lazy"
              className="h-7 w-auto object-contain opacity-50 mx-10"
            />
          ))}
        </Marquee>
      </Reveal>

      <Container>
        <Reveal delay={0.1} className="mt-14">
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-t border-l border-[#441611]/[0.08] rounded-md overflow-hidden list-none p-0 m-0">
            {visible.map((company, index) => (
              <m.li
                key={company.name}
                initial={reduce || index < 10 ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE, delay: ((index - 10) % 8) * 0.05 }}
              >
                <a
                  href={company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${company.name} — ${company.category}`}
                  className="relative flex justify-center items-center border-b border-r border-[#441611]/[0.08] px-6 py-12 group overflow-hidden bg-white h-full"
                >
                  <img
                    src={company.logo}
                    alt={`${company.name} — Satori Ventures portfolio`}
                    loading="lazy"
                    className="h-9 w-full object-contain opacity-55 transition duration-300 group-hover:opacity-0 group-focus-visible:opacity-0"
                  />
                  <div className="absolute inset-0 flex flex-col justify-center text-left px-5 py-4 bg-[#F6F4F2] opacity-0 translate-y-1 transition duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0">
                    <span className="text-[12px] font-inter font-semibold uppercase tracking-[0.14em] text-[#9B0801]">
                      {company.category}
                    </span>
                    <h3 className="text-[16px] font-dmSerifDisplay text-[#441611] leading-tight mt-1">{company.name}</h3>
                    <p className="text-[12px] font-dmSans text-[#6F5D5B] leading-snug mt-1.5 line-clamp-3">
                      {company.description}
                    </p>
                  </div>
                </a>
              </m.li>
            ))}
          </ul>
        </Reveal>

        <div className="flex justify-center mt-12">
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            aria-expanded={showMore}
            className="inline-flex items-center gap-2 text-[#441611] text-[16px] font-dmSans font-semibold border border-[#441611]/15 hover:border-[#441611]/30 hover:bg-[#F6F4F2] px-8 py-3.5 rounded-full transition-all duration-200 group"
          >
            <span>{showMore ? 'Show Less' : 'See More'}</span>
            {showMore ? (
              <IoIosArrowUp className="text-[18px] transition-transform duration-300 group-hover:-translate-y-0.5" />
            ) : (
              <IoIosArrowDown className="text-[18px] transition-transform duration-300 group-hover:translate-y-0.5" />
            )}
          </button>
        </div>
      </Container>
    </section>
  );
};

export default Portfolio;
