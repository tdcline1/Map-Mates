import React from 'react';
import '../styles/Note.css';

function Place({ place, onDelete }) {
  const formattedDate = new Date(place.created_at).toLocaleDateString('en-US');
  return (
    <div className="note-container">
      <p className="note-title">{place.name}</p>
      <p className="note-content">{place.description}</p>
      <p className="note-date">{formattedDate}</p>
      <button className="delete-button" onClick={() => onDelete(place.id)}>
        remove
      </button>
    </div>
  );
}

export default Place;
