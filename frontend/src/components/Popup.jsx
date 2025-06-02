import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import mapboxgl from 'mapbox-gl';
import { Rating } from 'react-simple-star-rating';
import '../styles/Popup.css';

const Popup = ({ map, activeFeature, onShowDetails, onClose }) => {
  const popupRef = useRef();
  const contentRef = useRef(document.createElement('div'));

  useEffect(() => {
    if (!map) return;

    popupRef.current = new mapboxgl.Popup({
      closeOnClick: false,
      offset: 20,
    });

    return () => {
      popupRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (activeFeature) {
    popupRef.current
      .setLngLat(activeFeature.geometry.coordinates)
      .setDOMContent(contentRef.current)
      .addTo(map);
    } else if (popupRef.current) {
      popupRef.current.remove();
    }
  }, [activeFeature]);

  return (
    <>
      {createPortal(
        <div className="portal-content">
          <button
            onClick={() => {
              {
                onClose();
              }
              popupRef.current?.remove();
            }}
            className="custom-close-button"
            aria-label="Close popup"
          >
            ×
          </button>
          {activeFeature?.properties.thumbnail_url ? (
            <img
              src={activeFeature?.properties.thumbnail_url}
              className="popup-image"
            />
          ) : null}
          <table>
            <tbody>
              <tr>
                <td>
                  <strong>Place:</strong>
                </td>
                <td>{activeFeature?.properties.name}</td>
              </tr>
              <tr>
                <td>
                  <strong>Adventure:</strong>
                </td>
                <td>{activeFeature?.properties.subtitle}</td>
              </tr>
              <tr>
                <td>
                  <strong>Rating:</strong>
                </td>
                <td>
                  <Rating
                    readonly
                    initialValue={activeFeature?.properties.rating}
                    size={20}
                    allowFraction
                  />
                </td>
              </tr>
              <tr>
                <td colSpan="2" style={{ textAlign: 'center' }}>
                  <button onClick={() => onShowDetails(activeFeature)}>
                    See Adventure Details!
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>,
        contentRef.current
      )}
    </>
  );
};

export default Popup;
