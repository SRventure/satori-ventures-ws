import img from '../../assets/footer/satorl_white.png';
import Container from '../../Components/Container/Container';
import { anchorHandler } from '../../motion/scrollTo';

const links = [
  { id: 'home', label: 'Home', offset: -140 },
  { id: 'about', label: 'About', offset: -96 },
  { id: 'portfolio', label: 'Portfolio', offset: -96 },
  { id: 'contact', label: 'Contact', offset: -40 },
];

const Footer = () => {
  return (
    <footer className="bg-[#441611] pt-16">
      <Container>
        <div className="md:flex md:justify-between md:items-start pb-14">
          <div>
            <a href="#home" onClick={anchorHandler('home', -140)} aria-label="Satori Ventures — back to top">
              <img src={img} alt="Satori Ventures" className="w-[140px]" loading="lazy" />
            </a>
            <p className="font-dmSans text-white/60 text-[14px] leading-relaxed max-w-[300px] mt-5">
              A venture capital firm investing in transformative Web3, blockchain,
              and AI companies.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-y-8 gap-x-20 mt-10 md:mt-1">
            <nav aria-label="Footer">
              <p className="font-inter text-white/50 text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">Explore</p>
              <ul className="font-dmSans text-white/90 text-[15px] space-y-2.5">
                {links.map(({ id, label, offset }) => (
                  <li key={id}>
                    <a href={`#${id}`} onClick={anchorHandler(id, offset)} className="hover:text-white hover:underline underline-offset-4">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="font-inter text-white/50 text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">Get in touch</p>
              <ul className="font-dmSans text-white/90 text-[15px] space-y-2.5">
                <li>
                  <a href="mailto:otc@satoriresearch.io" className="hover:text-white hover:underline underline-offset-4">
                    otc@satoriresearch.io
                  </a>
                </li>
                <li>
                  <a href="https://www.satori.ventures/" className="hover:text-white hover:underline underline-offset-4">
                    www.satori.ventures
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container>
          <p className="font-dmSans text-white/60 text-[13px] text-center py-6 tracking-wide">
            © {new Date().getFullYear()} Satori Ventures. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
