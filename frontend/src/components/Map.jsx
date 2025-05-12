import { useRef, useEffect, useState } from 'react';
import api from '../api';
import Marker from './Marker';
import Popup from './Popup';
import MapControls from './MapControls';
import AddPlaceMarker from './AddPlaceMarker';
import AddPlaceForm from './AddPlaceForm';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/Map.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function Map({ shouldBeVisible }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [hasBeenInitialized, setHasBeenInitialized] = useState(false);
  const [placeData, setPlaceData] = useState();
  const [activeFeature, setActiveFeature] = useState();
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [isShowingForm, setIsShowingForm] = useState(false);
  const [newPlaceLocation, setNewPlaceLocation] = useState();

  const fetchPlaces = () => {
    api
      .get('api/v1/geojson/')
      .then((res) => res.data)
      .then((data) => {
        setPlaceData(data);
      })
      .catch((err) => alert(err));
  };

  useEffect(() => {
    if (shouldBeVisible && !hasBeenInitialized && mapContainerRef.current) {
      console.log('Initializing map for the first time...');

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: [22.1194, 51.9013],
        zoom: 2.54,
      });

      fetchPlaces();

      mapRef.current.on('load', () => {
        console.log('Map loaded!');
      });

      setHasBeenInitialized(true);
    }
  }, [shouldBeVisible, hasBeenInitialized]);

  const mapStyle = {
    display: shouldBeVisible ? 'block' : 'none',
  };

  const handleMarkerClick = (feature) => {
    setActiveFeature(feature);
  };

  const handleAddPlaceClick = () => {
    setIsAddingPlace(true);
  };

  const handleSetLocation = (coordinates) => {
    setNewPlaceLocation(coordinates);
    setIsAddingPlace(false);
    setIsShowingForm(true);
  };

  const handleCancelAddPin = () => {
    setIsAddingPlace(false);
  };

  const handleCloseForm = () => {
    setIsShowingForm(false);
  };

  return (
    <>
      <div ref={mapContainerRef} className="map-container" style={mapStyle} />
      {shouldBeVisible &&
        mapRef.current &&
        !isAddingPlace &&
        !isShowingForm && (
          <MapControls map={mapRef.current} onAddPin={handleAddPlaceClick} />
        )}
      {shouldBeVisible && mapRef.current && isAddingPlace && (
        <AddPlaceMarker
          map={mapRef.current}
          onSetLocation={handleSetLocation}
          onClose={handleCancelAddPin}
        />
      )}
      {shouldBeVisible && mapRef.current && isShowingForm && (
        <AddPlaceForm
          coordinates={newPlaceLocation}
          onClose={handleCloseForm}
          fetchPlaces={fetchPlaces}
        />
      )}
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
