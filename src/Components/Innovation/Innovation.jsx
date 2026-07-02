import Container from '../Container/Container';
import Reveal from '../../motion/Reveal';
import Counter from '../../motion/Counter';

const stats = [
  { end: 128, suffix: '+', label: 'Investments', sub: 'Since 2022', highlight: true },
  { end: 20, prefix: '$', suffix: 'M+', label: 'Capital deployed', sub: 'Across Web3 & AI' },
  { end: 26, suffix: '', label: 'Portfolio companies', sub: 'Featured below' },
  { end: 15, suffix: '+', label: 'Sectors', sub: 'From L1s to robotics' },
];

const Innovation = () => {
  return (
    <section className="bg-[#F6F4F2] border-y border-[#441611]/[0.06]">
      <Container>
        <div className="py-20 md:py-24">
          <Reveal>
            <p className="font-dmSerifDisplay text-[#441611] text-[22px] md:text-[26px] leading-snug text-center max-w-[720px] mx-auto">
              Where ideas ignite, innovation takes flight — we champion the creators,
              share ownership, and decentralize the gains.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 mt-16 lg:divide-x lg:divide-[#441611]/10">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.1} className="text-center px-4">
                <p className={`font-dmSerifDisplay text-[44px] md:text-[56px] leading-none ${s.highlight ? 'text-[#9B0801]' : 'text-[#441611]'}`}>
                  <Counter end={s.end} prefix={s.prefix || ''} suffix={s.suffix} />
                </p>
                <p className="font-inter text-[13px] font-semibold uppercase tracking-[0.16em] text-[#441611] mt-4">{s.label}</p>
                <p className="font-dmSans text-[14px] text-[#6F5D5B]/80 mt-1">{s.sub}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Innovation;
