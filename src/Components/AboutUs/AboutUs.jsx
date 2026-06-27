import Container from "../Container/Container";
import aboutImg from '../../assets/about us/Looper1.png'
import circleImg from '../../assets/about us/design 2.png'

const AboutUs = () => {
  return (
    <Container>
      <div className="md:flex justify-between items-center my-32" id="about">
        <div className="md:w-1/2" data-aos="zoom-in" data-aos-easing="linear" data-aos-duration="800">
          <img src={aboutImg} alt="" aria-hidden="true" className="xl:w-[80%] heroImg" />
        </div>

        <div className="md:w-1/2 md:-mr-8 xl:-mr-20 mt-20 md:mt-6">
          <div>
            <div className="relative">
              <div className="absolute bottom-[98px] md:bottom-[90px] -left-[10px] md:-left-[44px] w-full" data-aos="fade-down" data-aos-easing="linear" data-aos-duration="800">
                <img src={circleImg} alt="" aria-hidden="true" className="w-[58px] md:w-[85px]" />
                <p className="text-[#F6524E] text-[14px] md:text-[17px] font-semibold font-inter uppercase absolute top-7 left-7  md:top-[43px] md:left-[38px]">About Us</p>
              </div>
              <h1 className="text-[33px] md:text-[35px] xl:text-[44px] text-[#441611] font-dmSerifDisplay leading-[58px] mb-[16px]">Innovating Visionary <br /> Solutions Together</h1>
            </div>

            <div className="font-dmSans">
              <p className="text-[20px] font-semibold mb-[30px] w-full md:w-[95%] 2xl:w-[50%]">
                <span className="text-[#7c5c58]">At Satori Ventures,</span>
                <span className="text-[#8a8686]"> we recognize the transformative power of blockchain</span>
              </p>

              <div className="text-[#6F5D5B] md:w-[95%] xl:w-[83%] 2xl:w-[53%] space-y-5">
                <p>We invest in the potential of tomorrow, employing a keen, eagle-eyed approach to pinpoint opportunities that redefine what's possible.</p>

                <p>Our global perspective, fortified by a robust Asian market presence, ensures that our partners are poised for international influence and success.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default AboutUs;
