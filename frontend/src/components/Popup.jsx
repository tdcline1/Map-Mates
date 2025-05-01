import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import mapboxgl from 'mapbox-gl';
import { Rating } from 'react-simple-star-rating';

const Popup = ({ map, activeFeature }) => {
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
    if (!activeFeature) return;

    popupRef.current
      .setLngLat(activeFeature.geometry.coordinates)
      .setHTML(contentRef.current.outerHTML)
      .addTo(map);
  }, [activeFeature]);

  return (
    <>
      {createPortal(
        <div className="portal-content">
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
              {activeFeature?.properties.thumbnail_url ? (
                <tr>
                  <img
                    src={activeFeature?.properties.thumbnail_url}
                    width="100%"
                  />
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>,
        contentRef.current
      )}
    </>
  );
};

export default Popup;
