import { useEffect, useRef, useState } from 'react';
import { useInView, animate, useReducedMotion } from 'framer-motion';

const Counter = ({ end, prefix = '', suffix = '', duration = 2.2, className }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? end : 0);

  useEffect(() => {
    if (reduce) {
      setValue(end);
      return;
    }
    if (!inView) return;
    const controls = animate(0, end, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, end, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString('en-US')}
      {suffix}
    </span>
  );
};

export default Counter;
