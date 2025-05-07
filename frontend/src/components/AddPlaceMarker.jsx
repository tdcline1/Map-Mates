import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import '../styles/MapControls.css';

const AddPlaceMarker = ({ map, onSetLocation, onCancel }) => {
  const [coordinates, setCoordinates] = useState({});

  useEffect(() => {
    const center = map.getCenter();
    const marker = new mapboxgl.Marker({
      draggable: true,
    })
      .setLngLat([center.lng, center.lat])
      .addTo(map);

    const onDragEnd = () => {
      const lngLat = marker.getLngLat();
      setCoordinates({ longitude: lngLat.lng, latitude: lngLat.lat });
    };

    marker.on('dragend', onDragEnd);
    return () => {
      marker.remove();
    };
  }, [map]);

  const handleSetLocation = () => {
    if (coordinates) {
      onSetLocation(coordinates);
    }
  };

  const handleCancel = () => {
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
