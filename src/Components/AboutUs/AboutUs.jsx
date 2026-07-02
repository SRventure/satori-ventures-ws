import Container from '../Container/Container';
import Reveal from '../../motion/Reveal';
import aboutImg from '../../assets/about us/Looper1.webp';

const AboutUs = () => {
  return (
    <section id="about" className="py-24 md:py-32">
      <Container>
        <div className="md:flex items-center gap-x-16">
          <Reveal className="md:w-[45%] mb-14 md:mb-0" y={0}>
            <img
              src={aboutImg}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="w-[85%] mx-auto md:mx-0 heroImg"
            />
          </Reveal>

          <div className="md:w-[55%]">
            <Reveal>
              <p className="eyebrow mb-4">About us</p>
              <h2 className="font-dmSerifDisplay text-[#441611] text-[36px] md:text-[44px] xl:text-[50px] leading-[1.12]">
                Innovating visionary
                <br />
                solutions, together
              </h2>
              <div className="w-14 h-[3px] bg-[#9B0801] mt-6" />
            </Reveal>

            <Reveal delay={0.15}>
              <p className="font-dmSans text-[#441611] text-[20px] leading-relaxed mt-8 max-w-[540px]">
                At Satori Ventures, we recognize the transformative power of blockchain —
                and its capacity to redefine economies.
              </p>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="font-dmSans text-[#6F5D5B] text-[16px] leading-relaxed space-y-5 mt-6 max-w-[540px]">
                <p>
                  We invest in the potential of tomorrow, employing a keen, eagle-eyed
                  approach to pinpoint opportunities that redefine what&apos;s possible —
                  across Web3, blockchain infrastructure, and frontier AI.
                </p>
                <p>
                  Our global perspective, fortified by a robust Asian market presence,
                  ensures our partners are poised for international influence and success.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default AboutUs;
