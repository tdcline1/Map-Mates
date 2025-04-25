import React from 'react';
import '../styles/Place.css';

function Place({ place, onDelete }) {
  const formattedDate = new Date(place.created_at).toLocaleDateString('en-US');
  return (
    <div className="note-container">
      <p className="note-title">{place.name}</p>
      <p className="note-content">{place.description}</p>
      <p className="note-date">{formattedDate}</p>
      {place.thumbnail_url && (
        <img
          src={place.thumbnail_url}
          alt={`${place.name} thumbnail`}
          className="place-thumbnail"
        />
      )}
      <button className="delete-button" onClick={() => onDelete(place.id)}>
        Remove
      </button>
    </div>
  );
}

export default Place;
