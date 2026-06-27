import { useEffect, useState } from 'react';
import { Link } from 'react-scroll';
import img from '../../assets/logo/satorl_color.png'
import Container from '../../Components/Container/Container';
import { MdArrowOutward } from "react-icons/md";

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkBase = 'mt-2 text-[#6B6463] cursor-pointer transition-colors duration-200 hover:text-[#9B0801]';
  const linkActive = 'font-bold text-[#9B0801]';

  const navOptions = <>
    <Link to="home" spy={true} smooth={true} offset={-130} duration={600} activeClass={linkActive} className={linkBase}> Home </Link>
    <Link to="about" spy={true} smooth={true} offset={-130} duration={600} activeClass={linkActive} className={`${linkBase} py-2 md:my-0 md:mx-[50px]`}> About </Link>
    <Link to="portfolio" spy={true} smooth={true} offset={-130} duration={700} activeClass={linkActive} className={linkBase}> Portfolio </Link>
  </>

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur shadow-sm' : 'bg-transparent'}`}>
      <Container>
        <div className="navbar font-dmSans px-0 py-3">
          <div className="navbar-start">
            <div className="drawer w-fit mr-2 md:hidden">
              <input id="my-drawer" type="checkbox" className="drawer-toggle" />
              <div className="drawer-content">
                {/* Page content here */}
                <label htmlFor="my-drawer">
                  <label htmlFor="my-drawer" className="">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                  </label>
                </label>
              </div>
              <div className="drawer-side z-10">
                <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu p-4 w-52 min-h-full bg-[#ecebe9] text-base-content">
                  {/* Sidebar content here */}
                  <img src={img} alt="Satori Ventures" className='cursor-pointer w-32' />
                  {navOptions}

                </ul>
              </div>
            </div>

            <Link to="home" smooth={true} duration={600} className="cursor-pointer">
              <img src={img} alt="Satori Ventures" className='cursor-pointer w-32 md:w-full' />
            </Link>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              {navOptions}
            </ul>
          </div>
          <div className="navbar-end">
            <Link to="contact" smooth={true} offset={0} duration={700} className="bg-[#9B0801] hover:bg-[#9b0901d8] text-white text-[16px] font-dmSans w-[130px] md:w-[150px] py-3 flex justify-center items-center rounded-md group cursor-pointer">
              <span className=''>Contact</span>
              <MdArrowOutward className='text-[18px] ml-2 group-hover:-mt-2 duration-300' />
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default NavBar;
