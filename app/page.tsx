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

export default function Home() {
  return (
    <>
      <Preloader />
      <Nav />
      <Hud />
      <main id="top">
        <Hero />
        <Marquee
          items={["Frontier AI", "Web3 Infrastructure", "Open Economies", "Renaissance"]}
          className="hairline-t hairline-b"
        />
        <Manifesto />
        <Conviction />
        <Stats />
        <Portfolio />
        <KineticWord word="RENAISSANCE" />
        <Focus />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
