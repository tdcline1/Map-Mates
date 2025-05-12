import React from 'react';
import { useState, useEffect } from 'react';
import api from '../api';
import { Rating } from 'react-simple-star-rating';
import '../styles/PlaceDetails.css';

const PlaceDetails = ({ feature, onClose }) => {
  const [placeData, setPlaceData] = useState(null);

  useEffect(() => {
    getPlaceData(feature.id);
  }, [feature.id]);

  const getPlaceData = (id) => {
    api
      .get(`api/v1/${id}/`)
      .then((res) => res.data)
      .then((data) => {
        setPlaceData(data);
      })
      .catch((err) => alert(err));
  };

  if (!placeData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close">
          x
        </button>
        <h1>{placeData?.name}</h1>
        {placeData.subtitle && <p>{placeData.subtitle}</p>}
        {placeData.rating && (
          <p>
            Rating:{' '}
            <Rating
              readonly
              initialValue={placeData.rating}
              size={20}
              allowFraction
            />
          </p>
        )}

        {placeData.description && <p>{placeData.description}</p>}
        {placeData.author && <p>Author: {placeData.author}</p>}
        {placeData.images &&
          placeData.images.map((image) => (
            <div key={image.url}>
              <img src={image.url} width="50%" />
              <p>{image.caption}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PlaceDetails;
