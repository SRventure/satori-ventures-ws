import { m, useReducedMotion } from 'framer-motion';
import { EASE } from './tokens';

// Editorial scroll reveal: fade + slide-up, fires once, ~15% in view.
const Reveal = ({ children, delay = 0, y = 28, className, as = 'div', ...rest }) => {
  const reduce = useReducedMotion();
  const Tag = m[as] || m.div;

  if (reduce) {
    const Static = as;
    return <Static className={className} {...rest}>{children}</Static>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
