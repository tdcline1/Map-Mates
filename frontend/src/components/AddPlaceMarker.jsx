import { useState, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import '../styles/MapControls.css';

const AddPlaceMarker = ({ map, onSetLocation, onCancel }) => {
  const [marker, setMarker] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  useEffect(() => {
    if (marker) {
      const onDragEnd = () => {
        const lngLat = marker.getLngLat();
        setCoordinates([lngLat.lng, lngLat.lat]);
      };
      marker.on('dragend', onDragEnd);
      return () => {
        marker.off('dragend', onDragEnd);
      };
    }
  }, [marker]);

  const addPin = useCallback(() => {
    if (!map) return;
    if (marker) marker.remove();

    const center = map.getCenter();
    const newMarker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([center.lng, center.lat])
      .addTo(map);
    setMarker(newMarker);
    setCoordinates([center.lng, center.lat]);
  }, [map, marker]);

  useEffect(() => {
    addPin();
    return () => {
      if (marker) marker.remove();
    };
  }, [addPin, marker]);

  const handleSetLocation = () => {
    if (coordinates) {
      onSetLocation(coordinates);
      if (marker) marker.remove();
    }
  };

  const handleCancel = () => {
    if (marker) marker.remove();
    onCancel();
  };

  return (
    <div className="map-controls-group map-controls-top-right">
      <button onClick={handleSetLocation} className="map-control-button">
        Set Location
      </button>
      <button onClick={handleCancel} className="map-control-button">
        Cancel
      </button>
    </div>
  );
};

export default AddPlaceMarker;
