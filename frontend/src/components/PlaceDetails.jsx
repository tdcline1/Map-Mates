import React from 'react';
import { useState, useEffect } from 'react';
import api from '../api';

const PlaceDetails = (place_id) => {
  const [place, setPlace] = useState();

  useEffect(() => {
    getPlace(place_id);
  }, []);

  const getPlace = () => {
    api
      .get(`api/v1/${place_id}/`)
      .then((res) => res.data)
      .then((data) => {
        setPlace(data);
      })
      .catch((err) => alert(err));
  };

  return (
    <div>
      <p>{place.name}</p>
      <p>{place.subtitle}</p>
      <p>{place.description}</p>
      {/* <img src={place.thumbnail_url} width="100%" /> */}
    </div>
  );
};

export default PlaceDetails;
