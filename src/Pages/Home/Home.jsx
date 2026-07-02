import { lazy, Suspense } from "react";
import Banner from "../../Components/Banner/Banner";
import Innovation from "../../Components/Innovation/Innovation";
import KineticType from "../../Components/KineticType/KineticType";
import AboutUs from "../../Components/AboutUs/AboutUs";
import Ventures from "../../Components/Ventures/Ventures";
import Portfolio from "../../Components/Portfolio/Portfolio";
import ClosingCta from "../../Components/ClosingCta/ClosingCta";

// Below-the-fold form (react-hook-form + emailjs + toast) ships as its own chunk.
const ContactUs = lazy(() => import("../../Components/ContactUs/ContactUs"));

const Home = () => {
  return (
    <main>
      <Banner />
      <Innovation />
      <KineticType />
      <AboutUs />
      <Ventures />
      <Portfolio />
      <ClosingCta />
      <Suspense fallback={<section id="contact" className="bg-[#F6F4F2] min-h-[500px]" />}>
        <ContactUs />
      </Suspense>
    </main>
  );
};

export default Home;
