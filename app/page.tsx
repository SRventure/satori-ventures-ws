import Nav from "@/components/Nav";
import Hero from "@/components/hero/Hero";
import Manifesto from "@/components/Manifesto";
import Stats from "@/components/Stats";
import Portfolio from "@/components/Portfolio";
import Focus from "@/components/Focus";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <Manifesto />
        <Stats />
        <Portfolio />
        <Focus />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
