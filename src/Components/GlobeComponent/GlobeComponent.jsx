import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import Globe from 'react-globe.gl';

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
      />
    </div>
  );
};

export default GlobeComponent;
