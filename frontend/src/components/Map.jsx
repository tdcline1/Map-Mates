import { useRef, useEffect, useState } from 'react';
import api from '../api';
import Marker from './Marker';
import Popup from './Popup';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/Map.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function Map({ shouldBeVisible }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  // TODO: Uncomment and use isMapLoaded when marker logic (or other post-load logic) is added.
  // const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [hasBeenInitialized, setHasBeenInitialized] = useState(false);
  const [placeData, setPlaceData] = useState();
  const [activeFeature, setActiveFeature] = useState();

  useEffect(() => {
    if (shouldBeVisible && !hasBeenInitialized && mapContainerRef.current) {
      console.log('Initializing map for the first time...');

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: [22.1194, 51.9013],
        zoom: 2.54,
      });

      //   const fetchPlaces = async () => {
      //     try {
      //       const data = await fetch(`api/v1/geojson/`).then((d) => d.json());

      //       setPlaceData(data);
      //     } catch (error) {
      //       console.error(error);
      //     }
      //   };
      const fetchPlaces = () => {
        api
          .get('api/v1/geojson/')
          .then((res) => res.data)
          .then((data) => {
            setPlaceData(data);
          })
          .catch((err) => alert(err));
      };
      fetchPlaces();

      mapRef.current.on('load', () => {
        console.log('Map loaded!');
        // setIsMapLoaded(true);
      });

      setHasBeenInitialized(true);
    }
  }, [shouldBeVisible, hasBeenInitialized]);

  const mapStyle = {
    display: shouldBeVisible ? 'block' : 'none',
  };

  const handleButtonClick = () => {
    mapRef.current.flyTo({
      center: [22.1194, 51.9013],
      zoom: 2.54,
    });
  };

  const handleMarkerClick = (feature) => {
    setActiveFeature(feature);
  };

  return (
    <>
      <button
        className="reset-button"
        onClick={handleButtonClick}
        style={mapStyle}
      >
        Europe
      </button>
      <div ref={mapContainerRef} className="map-container" style={mapStyle} />
      {mapRef.current &&
        placeData &&
        placeData.features?.map((feature) => {
          return (
            <Marker
              key={feature.id}
              map={mapRef.current}
              feature={feature}
              isActive={activeFeature?.id === feature.id}
              onClick={handleMarkerClick}
            />
          );
        })}
      {mapRef.current && (
        <Popup map={mapRef.current} activeFeature={activeFeature} />
      )}
    </>
  );
}

export default Map;
