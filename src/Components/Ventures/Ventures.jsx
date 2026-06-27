import Container from "../Container/Container";
import circleImg from '../../assets/about us/design 2.png'

const Ventures = () => {
  return (
    <div className="bg-[#F6F4F2] pt-28 pb-20">
      <Container>
        <div className="md:flex items-center xl:gap-x-20">
          <div className="relative md:w-1/2 md:ml-10">
            <div className="absolute bottom-[98px] md:bottom-[95px] -left-[10px] md:-left-[40px] w-full" data-aos="fade-down" data-aos-easing="linear" data-aos-duration="800" >
              <img src={circleImg} alt="" aria-hidden="true" className="w-[58px] md:w-[85px]" />
              <p className="text-[#F6524E] text-[14px] md:text-[17px] font-semibold font-inter uppercase absolute top-7 left-7 md:top-[43px] md:left-[38px]">Our Thesis</p>
            </div>
            <h1 className="text-[33px] md:text-[32px] xl:text-[41px] text-[#441611] font-dmSerifDisplay leading-[58px]">Satori Ventures <br /> Investment Philosophy</h1>
          </div>

          <div className="md:w-1/2">
            <div className="text-[#6F5D5B] font-dmSans space-y-3">
              <p className="w-full md:w-[95%] xl:w-[89%] 2xl:w-[55%]">Satori Ventures investment philosophy is rooted in the conviction that Web3 is the cornerstone of future digital autonomy.</p>

              <p className="w-full md:w-[95%] xl:w-[95%] 2xl:w-[55%]">Providing a foundation for economic decentralization and a crucible for innovations. that transcend today's possibilities, a vision we share and cultivate in partnership with the companies we back.</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Ventures;
