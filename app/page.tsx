import Nav from "@/components/Nav";
import Preloader from "@/components/Preloader";
import Marquee from "@/components/Marquee";
import Hero from "@/components/hero/Hero";
import Manifesto from "@/components/Manifesto";
import Conviction from "@/components/Conviction";
import Stats from "@/components/Stats";
import Portfolio from "@/components/Portfolio";
import KineticWord from "@/components/KineticWord";
import Focus from "@/components/Focus";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Hud from "@/components/ui/hud";
import SatoriCube from "@/components/SatoriCube";
import PortfolioConstellation from "@/components/PortfolioConstellation";

export default function Home() {
  return (
    <>
      <Preloader />
      <Nav />
      <Hud />
      <main id="top">
        <Hero />
        <SatoriCube />
        <Marquee
          items={["Frontier AI", "Web3 Infrastructure", "Open Economies", "Renaissance"]}
          className="hairline-t hairline-b"
        />
        <Manifesto />
        <Conviction />
        <Stats />
        <PortfolioConstellation />
        <Portfolio />
        <KineticWord word="RENAISSANCE" />
        <Focus />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
