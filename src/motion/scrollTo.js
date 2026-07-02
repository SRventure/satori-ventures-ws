// Anchor navigation that cooperates with Lenis (falls back to native scroll).
export const scrollToSection = (id, offset = -96) => {
  const el = document.getElementById(id);
  if (!el) return;

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const lenis = window.__lenis;

  if (lenis && !reduce) {
    lenis.scrollTo(el, { offset, duration: 1.2 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }
};

export const anchorHandler = (id, offset) => (e) => {
  e.preventDefault();
  scrollToSection(id, offset);
  history.replaceState(null, '', `#${id}`);
};
