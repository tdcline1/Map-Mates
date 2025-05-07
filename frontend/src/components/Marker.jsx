import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { createPortal } from 'react-dom';

// town options
import natureIcon from '../assets/icons/nature/tent-tree.svg';
import cityIcon from '../assets/icons/city/city.svg';
import defaultIcon from '../assets/icons/city/ranger-station.svg';

// hike options
// import natureIcon from '../assets/icons/nature/gtrees.svg';
// import cityIcon from '../assets/icons/nature/ghiking_dude.svg';
// import defaultIcon from '../assets/icons/nature/tent-tree.svg';

const Marker = ({ map, feature, isActive, onClick }) => {
  const { geometry, properties } = feature;

  const markerRef = useRef();
  const contentRef = useRef(document.createElement('div'));

  useEffect(() => {
    markerRef.current = new mapboxgl.Marker(contentRef.current)
      .setLngLat([geometry.coordinates[0], geometry.coordinates[1]])
      .addTo(map);

    return () => {
      markerRef.current.remove();
    };
  }, []);

  const getMarkerIcon = () => {
    switch (properties.category) {
      case 'nature':
        return natureIcon;
      case 'city':
        return cityIcon;
      default:
        return defaultIcon;
    }
  };

  const getMarkerColor = () => {
    switch (properties.category) {
      case 'nature':
        return 'rgb(11, 220, 39)';
      case 'city':
        return 'rgb(255, 84, 84)';
      default:
        return 'rgb(45, 94, 255)';
    }
  };

  return (
    <>
      {createPortal(
        <div
          onClick={() => onClick(feature)}
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: '30px',
            height: '30px',
            transform: 'translate(-50%, -100%) scale(1.2)',
          }}
        >
          <div
            style={{
              //   backgroundColor: isActive ? '#333' : getMarkerColor(),
              backgroundColor: getMarkerColor(),
              borderRadius: '50% 50% 0 50%',
              width: '100%',
              height: '100%',
              transform: 'rotate(45deg)',
              position: 'relative',
              boxShadow: isActive
                ? '0 2px 6px rgb(241, 244, 63)'
                : '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                position: 'absolute',
                top: '6px',
                left: '6px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src={getMarkerIcon()}
                alt={`${properties.category} marker`}
                width="12"
                height="12"
                style={{
                  transform: 'rotate(-45deg)',
                }}
              />
            </div>
          </div>
        </div>,
        contentRef.current
      )}
    </>
  );
};

export default Marker;
