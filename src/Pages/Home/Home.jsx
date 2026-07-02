import { lazy, Suspense } from "react";
import Banner from "../../Components/Banner/Banner";
import Innovation from "../../Components/Innovation/Innovation";
import AboutUs from "../../Components/AboutUs/AboutUs";
import Ventures from "../../Components/Ventures/Ventures";
import Portfolio from "../../Components/Portfolio/Portfolio";

// Below-the-fold form (react-hook-form + emailjs + toast) ships as its own chunk.
const ContactUs = lazy(() => import("../../Components/ContactUs/ContactUs"));

const Home = () => {
  return (
    <main>
      <Banner />
      <Innovation />
      <AboutUs />
      <Ventures />
      <Portfolio />
      <Suspense fallback={<section id="contact" className="bg-[#F6F4F2] min-h-[500px]" />}>
        <ContactUs />
      </Suspense>
    </main>
  );
};

export default Home;
