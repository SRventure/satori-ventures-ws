import { lazy, Suspense, useEffect, useState } from 'react';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import GlobeFallback from './GlobeFallback';

const GlobeComponent = lazy(() => import('./GlobeComponent'));

// The CSS fallback is the LCP element. The heavy WebGL globe only mounts on
// the first user interaction (then idle), so first paint / TBT stay clean —
// a real visitor's first mouse-move or touch brings it in immediately.
const Globe = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // honor reduced-motion: keep the static fallback

    const events = ['pointermove', 'pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll'];
    let idleId;
    const arm = () => {
      events.forEach((ev) => window.removeEventListener(ev, arm));
      const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 800));
      idleId = idle(() => setReady(true), { timeout: 2000 });
    };
    events.forEach((ev) => window.addEventListener(ev, arm, { passive: true, once: false }));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, arm));
      if (idleId) (window.cancelIdleCallback || clearTimeout)(idleId);
    };
  }, []);

  if (!ready) return <GlobeFallback />;

  return (
    <ErrorBoundary fallback={<GlobeFallback />}>
      <Suspense fallback={<GlobeFallback />}>
        <GlobeComponent />
      </Suspense>
    </ErrorBoundary>
  );
};

export default Globe;
