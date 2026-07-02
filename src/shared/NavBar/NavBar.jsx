import { useEffect, useState } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MdArrowOutward } from 'react-icons/md';
import logo from '../../assets/logo/satorl_color.png';
import Container from '../../Components/Container/Container';
import Magnetic from '../../motion/Magnetic';
import { anchorHandler } from '../../motion/scrollTo';
import useActiveSection from '../../motion/useActiveSection';
import { EASE } from '../../motion/tokens';

const SECTIONS = ['home', 'about', 'portfolio', 'contact'];

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(SECTIONS);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigate = (id, offset) => (e) => {
    setOpen(false);
    anchorHandler(id, offset)(e);
  };

  const links = [
    { id: 'home', label: 'Home', offset: -140 },
    { id: 'about', label: 'About', offset: -96 },
    { id: 'portfolio', label: 'Portfolio', offset: -96 },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAF8F7]/85 backdrop-blur-md border-b border-[#441611]/10 shadow-[0_1px_20px_rgba(68,22,17,0.06)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <Container>
        <nav className="flex items-center justify-between py-4 font-dmSans" aria-label="Primary">
          <a href="#home" onClick={navigate('home', -140)} className="shrink-0" aria-label="Satori.Ventures — home">
            <img src={logo} alt="Satori.Ventures" className="w-32 md:w-40" />
          </a>

          <ul className="hidden lg:flex items-center gap-x-12">
            {links.map(({ id, label, offset }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={navigate(id, offset)}
                  className={`nav-underline text-[15px] tracking-wide transition-colors duration-200 ${
                    active === id ? 'is-active text-[#9B0801] font-semibold' : 'text-[#6F5D5B] hover:text-[#441611]'
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Magnetic strength={0.22} className="hidden sm:inline-block">
              <a
                href="#contact"
                onClick={navigate('contact', -40)}
                className="group inline-flex items-center gap-2 bg-[#9B0801] hover:bg-[#7d0701] text-white text-[15px] font-semibold px-6 py-3 rounded-full transition-colors duration-200"
              >
                <span>Contact</span>
                <MdArrowOutward className="text-[17px] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Magnetic>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden p-2 text-[#441611]"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10m-10 6h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </Container>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            className="lg:hidden overflow-hidden bg-[#FAF8F7]/95 backdrop-blur-md border-b border-[#441611]/10"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <Container>
              <ul className="flex flex-col gap-1 py-4 font-dmSans">
                {[...links, { id: 'contact', label: 'Contact', offset: -40 }].map(({ id, label, offset }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      onClick={navigate(id, offset)}
                      className={`block py-2.5 text-[17px] ${
                        active === id ? 'text-[#9B0801] font-semibold' : 'text-[#441611]'
                      }`}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </Container>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default NavBar;
