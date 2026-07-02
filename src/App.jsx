import { lazy, Suspense } from 'react';
import SmoothScroll from './motion/SmoothScroll';
import NavBar from './shared/NavBar/NavBar';
import Footer from './shared/Footer/Footer';
import Home from './Pages/Home/Home';

const NotFound = lazy(() => import('./Pages/NotFound/NotFound'));

// Single-page site: no router needed. Vercel rewrites all paths to
// index.html, so unknown paths render the lightweight 404 chunk.
const App = () => {
  if (window.location.pathname !== '/') {
    return (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    );
  }

  return (
    <div>
      <SmoothScroll />
      <NavBar />
      <Home />
      <Footer />
    </div>
  );
};

export default App;
