import { FaArrowLeft } from "react-icons/fa";
import image from "../../assets/our thesis/404_Not-found.png"

const NotFound = () => {
  return (
    <div className="hero min-h-screen pb-10">
      <div className="hero-content text-center">
        <div>
          <div className='mb-8'>
            <img src={image} alt="Page Not Found" className="w-[90%] mx-auto"/>
          </div>
          <h1 className="text-4xl text-[#7e7b7b] font-dmSerifDisplay -mt-5 -mb-3">Oops! <br />Page not found</h1>
          <p className="text-[#999595] py-6">The page you are looking for could not be found.</p>
          <a href="/" className="btn bg-[#DAA59F] hover:bg-[#c2918d] text-[15px] group"> <FaArrowLeft className=' group-hover:mr-1 duration-200' /> Back to Home</a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
