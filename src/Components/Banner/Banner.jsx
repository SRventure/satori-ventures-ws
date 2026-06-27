import { Link } from 'react-scroll';
import { MdArrowOutward } from "react-icons/md";
import Container from "../Container/Container";
import Globe from "../GlobeComponent/Globe";


const Banner = () => {

  return (
    <Container>
      <div className="flex flex-col md:flex-row justify-center md:justify-between items-center mt-16 mb-[85px]" id="home">
        {/* Contents */}
        <div className="md:w-1/2 md:-mt-10">
          <div className="text-[42px] md:text-[62px] text-[#441611] font-dmSerifDisplay">
            <h2 className="mr-3" data-aos="fade-up" data-aos-duration="600">Fostering</h2>
            <h2 className="md:-my-5" data-aos="fade-up" data-aos-duration="800">The <span className="text-[#9B0801]">Blockchain</span></h2>
            <h2 data-aos="fade-up" data-aos-duration="1000">Renaissance</h2>
          </div>

          <p className="text-[#5D423F] font-dmSans w-[86%] 2xl:w-[54%] mt-1" data-aos="fade-up" data-aos-duration="1500">The transformative power of blockchain and its capacity to redefine economies. We invest in the potential.</p>

          <div className="flex flex-wrap items-center gap-4 mt-8" data-aos="fade-up" data-aos-duration="1700">
            <Link to="portfolio" smooth={true} offset={-130} duration={700} className="bg-[#9B0801] hover:bg-[#9b0901d8] text-white text-[16px] font-dmSans font-semibold px-7 py-3 flex justify-center items-center rounded-md group cursor-pointer duration-200">
              <span>View Portfolio</span>
              <MdArrowOutward className='text-[18px] ml-2 group-hover:-mt-1 group-hover:ml-3 duration-300' />
            </Link>
            <Link to="contact" smooth={true} offset={0} duration={700} className="text-[#441611] text-[16px] font-dmSans font-semibold border border-[#E3E3E3] hover:border-[#d8d7d7] hover:bg-[#F6F4F2] px-7 py-3 flex justify-center items-center rounded-md cursor-pointer duration-200">
              <span>Get in touch</span>
            </Link>
          </div>
        </div>

        {/* Globe */}
        <div className="md:w-1/2">
          <div>
            <Globe />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Banner;
