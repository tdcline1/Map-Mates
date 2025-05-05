import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const PlaceDetails = () => {
  const { id } = useParams();
  const [placeData, setPlaceData] = useState(null);

  useEffect(() => {
    getPlaceData(id);
  }, [id]);

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
    <div>
      <h1>{placeData?.name}</h1>
      {placeData.subtitle && <p>{placeData.subtitle}</p>}
      {placeData.rating && <p>Rating: {placeData.rating}</p>}
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
  );
};

export default PlaceDetails;
