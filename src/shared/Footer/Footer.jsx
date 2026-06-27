import { Link } from 'react-scroll';
import img from '../../assets/footer/satorl_white.png'
import Container from '../../Components/Container/Container';

const Footer = () => {
  return (
    <div className='bg-[#441611] pt-12'>
      <Container>
        <div className='md:flex md:justify-between items-center mb-12'>
          <Link to="/">
            <img src={img} alt="Satori Ventures" className='w-[135px] cursor-pointer' />
          </Link>

          <div className='font-dmSans flex flex-col md:flex-row gap-y-3 md:gap-x-10 text-white mt-5 md:mt-0'>
            <Link to="home" smooth={true} offset={-150} duration={700} className='hover:underline cursor-pointer'>Home</Link>
            <Link to="portfolio" smooth={true} offset={-150} duration={600} className='hover:underline cursor-pointer'>Portfolio</Link>
            <Link to="about" smooth={true} offset={-150} duration={600} className='hover:underline cursor-pointer'>About</Link>
            <Link to="contact" smooth={true} offset={-150} duration={600} className='hover:underline cursor-pointer'>Contact</Link>
          </div>
        </div>
      </Container>
      <p className='text-white text-[16px] text-center font-dmSans uppercase py-5 border-t border-[#4D211D]'>©{new Date().getFullYear()} Satori Ventures. All Rights Reserved.</p>
    </div>
  );
};

export default Footer;
