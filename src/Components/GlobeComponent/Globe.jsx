import { lazy, Suspense } from 'react';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import GlobeFallback from './GlobeFallback';

const GlobeComponent = lazy(() => import('./GlobeComponent'));

const Globe = () => {
  return (
    <ErrorBoundary fallback={<GlobeFallback />}>
      <Suspense fallback={<GlobeFallback />}>
        <GlobeComponent />
      </Suspense>
    </ErrorBoundary>
  );
};

export default Globe;
