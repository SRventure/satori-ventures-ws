import Container from '../Container/Container';
import Reveal from '../../motion/Reveal';

const pillars = [
  {
    title: 'Web3 Infrastructure',
    body: 'Layer 1s, oracles, and the decentralized rails on which the next internet settles — the cornerstone of digital autonomy.',
  },
  {
    title: 'Frontier AI',
    body: 'Foundation models, AI-native biology, and embodied robotics — intelligence as the defining technology of the decade.',
  },
  {
    title: 'Open Economies',
    body: 'DeFi, payments, and ownership networks that decentralize the gains and put economic power in more hands.',
  },
];

const Ventures = () => {
  return (
    <section className="bg-[#F6F4F2] py-24 md:py-32 border-y border-[#441611]/[0.06]">
      <Container>
        <div className="max-w-[760px]">
          <Reveal>
            <p className="eyebrow mb-4">Our thesis</p>
            <h2 className="font-dmSerifDisplay text-[#441611] text-[34px] md:text-[42px] xl:text-[48px] leading-[1.15]">
              Web3 is the cornerstone of
              <br className="hidden md:block" /> future digital autonomy.
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="font-dmSans text-[#6F5D5B] text-[17px] leading-relaxed mt-6 max-w-[600px]">
              A foundation for economic decentralization and a crucible for innovations
              that transcend today&apos;s possibilities — a vision we cultivate in
              partnership with the companies we back.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {pillars.map((p, i) => (
            <Reveal
              key={p.title}
              delay={i * 0.12}
              className="group bg-white rounded-2xl p-8 border border-[#441611]/[0.06] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(68,22,17,0.10)]"
            >
              <div className="w-9 h-[3px] bg-[#9B0801] mb-6 transition-all duration-300 group-hover:w-14" />
              <h3 className="font-dmSerifDisplay text-[#441611] text-[24px] leading-tight">{p.title}</h3>
              <p className="font-dmSans text-[#6F5D5B] text-[15px] leading-relaxed mt-4">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Ventures;
