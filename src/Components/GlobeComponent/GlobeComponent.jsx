import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import Globe from 'react-globe.gl';

// Investment hubs — arcs radiate from Asia (Singapore / Hong Kong)
const HUBS = [
  { lat: 1.35, lng: 103.82 }, // Singapore
  { lat: 22.32, lng: 114.17 }, // Hong Kong
  { lat: 35.68, lng: 139.69 }, // Tokyo
  { lat: 37.77, lng: -122.42 }, // San Francisco
  { lat: 40.71, lng: -74.0 }, // New York
  { lat: 51.51, lng: -0.13 }, // London
  { lat: 25.2, lng: 55.27 }, // Dubai
];

const ARCS = [
  [0, 3], [0, 5], [0, 2], [0, 6], [1, 4], [1, 3], [1, 5], [2, 4],
].map(([a, b]) => ({
  startLat: HUBS[a].lat,
  startLng: HUBS[a].lng,
  endLat: HUBS[b].lat,
  endLng: HUBS[b].lng,
}));

const GlobeComponent = () => {
  const [countries, setCountries] = useState({ features: [] });
  const globeRef = useRef();
  const wrapRef = useRef();

  useEffect(() => {
    const controls = globeRef.current?.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.55;
      controls.enableZoom = false;
    }
  }, []);

  // Pause the render loop whenever the globe is scrolled out of view.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      const g = globeRef.current;
      if (!g) return;
      if (entry.isIntersecting) g.resumeAnimation();
      else g.pauseAnimation();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const globeMaterial = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: '#f3eeec',
        transparent: true,
        opacity: 0.95,
        shininess: 6,
      }),
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/map.geojson');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div ref={wrapRef} className='md:-mt-8 md:ml-20 heroImg'>
      <Globe
        ref={globeRef}
        width={550}
        height={550}
        backgroundColor='rgba(0,0,0,0)'
        showGraticules={true}
        atmosphereColor='#9b0901f8'
        atmosphereAltitude='0.25'
        globeMaterial={globeMaterial}
        rendererConfig={{ antialias: false, powerPreference: 'low-power' }}

        hexPolygonsData={countries.features}
        hexPolygonResolution={3}
        hexPolygonMargin={0.3}
        hexPolygonUseDots={true}
        hexPolygonColor={() => `#9B0801`}

        arcsData={ARCS}
        arcColor={() => ['rgba(155,8,1,0)', 'rgba(155,8,1,0.8)']}
        arcAltitudeAutoScale={0.4}
        arcStroke={0.4}
        arcDashLength={0.45}
        arcDashGap={1.1}
        arcDashAnimateTime={3400}
        arcsTransitionDuration={0}

        pointsData={HUBS}
        pointColor={() => '#9B0801'}
        pointAltitude={0.005}
        pointRadius={0.45}

        ringsData={HUBS}
        ringColor={() => (t) => `rgba(155,8,1,${Math.max(0, 0.5 * (1 - t))})`}
        ringMaxRadius={3.2}
        ringPropagationSpeed={1.1}
        ringRepeatPeriod={2200}
      />
    </div>
  );
};

export default GlobeComponent;
