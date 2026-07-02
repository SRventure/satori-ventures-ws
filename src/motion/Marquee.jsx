// Infinite logo marquee. Pure CSS animation (keyframes in index.css) so it
// stays off the main thread; pauses on hover; static row under reduced motion.
const Marquee = ({ children, speed = 38, className = '' }) => {
  return (
    <div className={`marquee-mask overflow-hidden ${className}`} aria-hidden="true">
      <div className="marquee-track flex w-max items-center" style={{ '--marquee-duration': `${speed}s` }}>
        <div className="flex items-center shrink-0">{children}</div>
        <div className="flex items-center shrink-0">{children}</div>
      </div>
    </div>
  );
};

export default Marquee;
