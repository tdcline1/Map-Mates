import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { createPortal } from 'react-dom';

import natureIcon from '../assets/icons/nature_badge.svg';
import cityIcon from '../assets/icons/buildingswhite.svg';
import defaultIcon from '../assets/icons/hike_dude.svg';

const Marker = ({ map, feature }) => {
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
        return '#4285F4';
      case 'city':
        return '#EA4335';
      default:
        return 'rgb(26, 173, 45)';
    }
  };

  return (
    <>
      {createPortal(
        <div
          style={{
            position: 'relative',
            width: '30px',
            tansform: 'translate(-50%, -100%)',
          }}
        >
          <div
            style={{
              backgroundColor: getMarkerColor(),
              borderRadius: '50% 50% 0 50%',
              width: '100%',
              height: '100%',
              transform: 'rotate(45deg)',
              position: 'relative',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
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
                  color: getMarkerColor(),
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
