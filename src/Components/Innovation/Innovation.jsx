import Container from '../Container/Container';
import { FiDollarSign } from "react-icons/fi";
import { HiOutlineHashtag } from "react-icons/hi";
import CountUp from 'react-countup';

const Innovation = () => {
  return (
    <div className='bg-[#F6F4F2]'>
      <Container>
        {/* Section heading info */}
        <div className='py-[109px]'>
          <p className='font-dmSans text-[#5D423F] w-[95%] md:w-[65%] xl:w-[62%] 2xl:w-[40%] mx-auto text-center text-[21px]'>Where ideas ignite, innovation takes flight, breaking the old chains, in decentralized domains – we champion the creators, share ownerships, and decentralize the gains</p>

          {/* Cards  */}
          <div className='md:flex justify-center gap-6 mt-10 px-3'>
            <div className='flex justify-around items-center bg-white md:w-[450px] xl:w-[507px] h-[150px] rounded-xl mb-6 md:mb-0' data-aos="fade-right" data-aos-easing="linear" data-aos-duration="1000">
              <div>
                <CountUp start={0}
                  end={20}
                  duration={4}
                  separator=" "
                  suffix=" Million USD+"
                  className="text-[31px] text-[#441611] font-bold mb-2"
                />
                <p className='font-inter text-[#5D423F] text-[17px]'>Investment in USD</p>
              </div>

              <div className='relative'>
                <div className='bg-[#441611] w-14 h-14 rounded-full flex justify-center items-center'>
                  <FiDollarSign className='text-[32px] text-white' />
                </div>
                <div className="animate-ping absolute top-2 left-2 inline-flex h-10 w-10 bg-[#441611] rounded-full opacity-50"></div>
              </div>
            </div>

            <div className='flex justify-around items-center bg-white  md:w-[450px] xl:w-[507px] h-[150px] rounded-xl' data-aos="fade-left" data-aos-easing="linear" data-aos-duration="1000">
              <div>
                <CountUp
                  start={0}
                  end={28}
                  duration={4}
                  separator=" "
                  suffix=" (Since 2022)"
                  className="text-[31px] text-[#441611] font-bold mb-2"
                />
                <p className='font-inter text-[#5D423F] text-[17px]'>Number of Investments</p>
              </div>

              <div className="relative">
                <div className='bg-[#441611] w-14 h-14 rounded-full flex justify-center items-center'>
                  <HiOutlineHashtag className='text-[32px] text-white' />
                </div>
                <div className="animate-ping absolute top-2 left-2 inline-flex h-10 w-10 bg-[#441611] rounded-full opacity-50"></div>
              </div>

            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Innovation;