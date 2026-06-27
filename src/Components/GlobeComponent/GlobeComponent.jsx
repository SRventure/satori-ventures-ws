import { useEffect, useState } from 'react';
import Globe from 'react-globe.gl';

const GlobeComponent = () => {
  const [countries, setCountries] = useState({ features: [] });

  const myData = [
    {
      longitude: -122.4194,
      latitude: 37.7749,
      label: 'San Francisco',
      color: 'red',
      altitude: 0.2,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/map.geojson');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setCountries(data);
        // console.log(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className='md:-mt-8 md:ml-20 heroImg'>
      <Globe
        width={550}
        height={550}
        pointsData={myData}
        backgroundColor='#fff'
        showGraticules={true}
        atmosphereColor='#9b0901f8'
        atmosphereAltitude='0.25'
        globeImageUrl='/earth-texture.jpg'

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
