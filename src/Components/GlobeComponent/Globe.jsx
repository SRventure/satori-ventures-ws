import { lazy, Suspense, useEffect, useState } from 'react';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import GlobeFallback from './GlobeFallback';

const GlobeComponent = lazy(() => import('./GlobeComponent'));

// Show the lightweight CSS fallback as the LCP element, then mount the heavy
// WebGL globe once the browser is idle so it doesn't block first paint.
const Globe = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // honor reduced-motion: keep the static fallback
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));
    const id = idle(() => setReady(true), { timeout: 2500 });
    return () => (window.cancelIdleCallback || clearTimeout)(id);
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
