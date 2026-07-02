import { useRef } from 'react';
import { m, useScroll, useTransform, useReducedMotion } from 'framer-motion';

const Row = ({ progress, from, to, children }) => {
  const x = useTransform(progress, [0, 1], [from, to]);
  return (
    <m.div style={{ x }} className="whitespace-nowrap will-change-transform">
      {children}
    </m.div>
  );
};

const Words = ({ items }) => (
  <>
    {Array.from({ length: 4 }).map((_, r) =>
      items.map((w, i) => (
        <span key={`${r}-${i}`} className={`${w.className} mx-5 md:mx-8 align-baseline`}>
          {w.text}
        </span>
      ))
    )}
  </>
);

const rows = [
  {
    from: '2%',
    to: '-14%',
    items: [
      { text: 'Blockchain', className: 'text-[#441611]' },
      { text: 'Renaissance', className: 'type-outline italic' },
    ],
  },
  {
    from: '-14%',
    to: '2%',
    items: [
      { text: 'Frontier AI', className: 'type-outline' },
      { text: 'Web3', className: 'text-[#9B0801] italic' },
      { text: 'Open Economies', className: 'text-[#441611]' },
    ],
  },
  {
    from: '0%',
    to: '-10%',
    items: [
      { text: 'Satori', className: 'text-[#9B0801]' },
      { text: 'Ventures', className: 'type-outline italic' },
    ],
  },
];

const KineticType = () => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  return (
    <section
      ref={ref}
      aria-hidden="true"
      className="overflow-hidden py-20 md:py-28 select-none"
    >
      <div className="font-dmSerifDisplay leading-[1.04] text-[56px] md:text-[96px] xl:text-[120px]">
        {rows.map((row, i) =>
          reduce ? (
            <div key={i} className="whitespace-nowrap">
              <Words items={row.items} />
            </div>
          ) : (
            <Row key={i} progress={scrollYProgress} from={row.from} to={row.to}>
              <Words items={row.items} />
            </Row>
          )
        )}
      </div>
    </section>
  );
};

export default KineticType;
