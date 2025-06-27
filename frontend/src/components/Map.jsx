import { useRef, useEffect, useState } from 'react';
import api from '../api';
import Marker from './Marker';
import Popup from './Popup';
import MapControls from './MapControls';
import AddPlaceMarker from './AddPlaceMarker';
import AddPlaceForm from './AddPlaceForm';
import PlaceDetails from './PlaceDetails';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/Map.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const Map = ({ isAuthenticated }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const userHasInteractedRef = useRef(false);
  const [hasBeenInitialized, setHasBeenInitialized] = useState(false);
  const [placeData, setPlaceData] = useState();
  const [activeFeature, setActiveFeature] = useState();
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [isShowingForm, setIsShowingForm] = useState(false);
  const [newPlaceLocation, setNewPlaceLocation] = useState();
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState(null);
  const [placeToEdit, setPlaceToEdit] = useState(null);

  const fetchPlaces = () => {
    api
      .get('api/v1/geojson/')
      .then((res) => res.data)
      .then((data) => {
        setPlaceData(data);
      })
      .catch((err) => alert('Error fetching places geoJSON:', err));
  };

  const spinGlobe = () => {
    const center = mapRef.current.getCenter();
    center.lng -= 4;

    mapRef.current.easeTo({
      center,
      duration: 1000,
      easing: (n) => n,
    });
  };

  const handleUserInteraction = () => {
    userHasInteractedRef.current = true;
    mapRef.current.off('mousedown', handleUserInteraction);
    mapRef.current.off('touchstart', handleUserInteraction);
    mapRef.current.off('wheel', handleUserInteraction);
    mapRef.current.off('dblclick', handleUserInteraction);
  };

  useEffect(() => {
    if (!hasBeenInitialized && mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        center: [22, 48],
        zoom: 2.54,
      });

      fetchPlaces();

      mapRef.current.on('load', () => {
        // mapRef.current.setFog({
        //   // range: [-1, 2],
        //   // 'horizon-blend': 0.3,
        //   // color: '#242B4B',
        //   // 'high-color': '#161B36',
        //   // 'space-color': '#0B1026',
        //   // 'star-intensity': 0.8,
        // });
        spinGlobe();
      });

      mapRef.current.on('mousedown', handleUserInteraction);
      mapRef.current.on('touchstart', handleUserInteraction);
      mapRef.current.on('wheel', handleUserInteraction);
      mapRef.current.on('dblclick', handleUserInteraction);

      mapRef.current.on('moveend', () => {
        if (!userHasInteractedRef.current) {
          spinGlobe();
        }
      });

      setHasBeenInitialized(true);
    }
  }, [hasBeenInitialized]);

  const handleMarkerClick = (feature) => {
    setActiveFeature(feature);
  };

  const closePopup = () => {
    setActiveFeature(null);
  };

  const handleAddPlaceClick = () => {
    setPlaceToEdit(null);
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

  const handleShowDetails = (feature) => {
    setSelectedPlaceDetails(feature);
  };

  const handleCloseDetailsModal = () => {
    setSelectedPlaceDetails(null);
  };

  const handleEditPlace = (placeData) => {
    setPlaceToEdit(placeData);
    setIsShowingForm(true);
    setSelectedPlaceDetails(null);
  };

  return (
    <>
      <div ref={mapContainerRef} className="map-container" />
      {mapRef.current && !isAddingPlace && !isShowingForm && (
        <MapControls
          map={mapRef.current}
          onAddPin={handleAddPlaceClick}
          isAuthenticated={isAuthenticated}
        />
      )}
      {mapRef.current && isAddingPlace && (
        <AddPlaceMarker
          map={mapRef.current}
          onSetLocation={handleSetLocation}
          onCancel={handleCancelAddPin}
        />
      )}
      {mapRef.current && isShowingForm && (
        <AddPlaceForm
          coordinates={newPlaceLocation}
          onClose={handleCloseForm}
          fetchPlaces={fetchPlaces}
          placeToEdit={placeToEdit}
          onClosePopup={closePopup}
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
        <Popup
          map={mapRef.current}
          activeFeature={activeFeature}
          onShowDetails={handleShowDetails}
          onClose={closePopup}
        />
      )}
      {mapRef.current && selectedPlaceDetails && (
        <PlaceDetails
          feature={selectedPlaceDetails}
          onClose={handleCloseDetailsModal}
          onEdit={handleEditPlace}
          fetchPlaces={fetchPlaces}
          onClosePopup={closePopup}
        />
      )}
    </>
  );
};

export default Map;
