// Shared motion vocabulary — one ease, few durations, so the whole site moves as one.
export const EASE = [0.22, 1, 0.36, 1];

export const revealVariants = (y = 28) => ({
  hidden: { opacity: 0, y },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE, delay },
  }),
});
