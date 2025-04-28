import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function Map({ shouldBeVisible }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [hasBeenInitialized, setHasBeenInitialized] = useState(false);

  useEffect(() => {
    if (shouldBeVisible && !hasBeenInitialized && mapContainerRef.current) {
      console.log('Initializing map for the first time...');

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: [22.1194, 51.9013],
        zoom: 2.54,
      });

      mapRef.current.on('load', () => {
        console.log('Map loaded!');
        setIsMapLoaded(true);
      });

      setHasBeenInitialized(true);

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          console.log('Map instance removed on unmount');
        }
      };
    }
  }, [shouldBeVisible, hasBeenInitialized]);

  const mapStyle = {
    display: shouldBeVisible ? 'block' : 'none',
  };

  return (
    <div ref={mapContainerRef} className="map-container" style={mapStyle} />
  );
}

export default Map;
