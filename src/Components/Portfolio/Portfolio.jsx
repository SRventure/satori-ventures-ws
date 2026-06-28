import { useState } from "react";
import { companies } from "../../data/data";
import Container from "../Container/Container";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const Portfolio = () => {
  const [showMore, setShowMore] = useState(false);
  const visible = showMore ? companies : companies.slice(0, 10);

  return (
    <div className="my-32" id="portfolio">
      <Container>
        <div className="text-center">
          <h2 className="text-[33px] md:text-[32px] xl:text-[41px] text-[#441611] font-dmSerifDisplay leading-[58px]" data-aos="fade-up" data-aos-easing="linear" data-aos-duration="800">Let's see our portfolio</h2>

          <p className="text-[#6F5D5B] text-[20px] font-dmSans w-full md:w-[58%] xl:w-[58%] 2xl:w-[35%] mx-auto mt-4 mb-12" data-aos="fade-up" data-aos-easing="linear" data-aos-duration="1000">Discover our portfolio for a glimpse into our expertise, showcasing achievements and diverse capabilities.</p>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-t border-l border-[#ebedf0] rounded-md overflow-hidden"
          data-aos="fade-up"
          data-aos-easing="linear"
          data-aos-duration="800"
        >
          {visible.map((company, index) => (
            <a
              key={index}
              href={company.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${company.name} — ${company.category}`}
              className="relative flex justify-center items-center border-b border-r border-[#ebedf0] px-6 py-12 group overflow-hidden"
            >
              <img
                src={company.logo}
                alt={`${company.name} — Satori Ventures portfolio`}
                loading="lazy"
                className="h-9 w-full object-contain opacity-55 transition duration-300 group-hover:opacity-0"
              />
              <div className="absolute inset-0 flex flex-col justify-center text-left px-5 py-4 bg-[#F6F4F2] opacity-0 translate-y-1 transition duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                <span className="text-[10px] font-dmSans font-semibold uppercase tracking-[0.12em] text-[#9B0801]">{company.category}</span>
                <h3 className="text-[16px] font-dmSerifDisplay text-[#441611] leading-tight mt-1">{company.name}</h3>
                <p className="text-[11px] font-dmSans text-[#6F5D5B] leading-snug mt-1.5 line-clamp-3">{company.description}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="flex justify-center mt-[45px] 2xl:mt-[70px]">
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="text-[#441611] text-[16px] font-dmSans font-semibold border border-[#E3E3E3] hover:border-[#d8d7d7] hover:bg-[#F6F4F2] w-[150px] py-3 flex justify-center items-center rounded-md group duration-200"
          >
            <span>{showMore ? "Show Less" : "See More"}</span>
            {showMore ? <IoIosArrowUp className='text-[18px] ml-2 duration-300 group-hover:rotate-180' /> : <IoIosArrowDown className='text-[18px] ml-2 duration-300 group-hover:rotate-180' />}
          </button>
        </div>
      </Container>
    </div>
  );
};

export default Portfolio;
