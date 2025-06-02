import React, { useState, useEffect } from 'react';
import api from '../api';
import { Rating } from 'react-simple-star-rating';
import '../styles/PlaceDetails.css';

const PlaceDetails = ({
  feature,
  onClose,
  onEdit,
  fetchPlaces,
  onClosePopup,
}) => {
  const [placeData, setPlaceData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleEdit = () => {
    onEdit(placeData);
  };

  const handleDelete = async () => {
    try {
      const res = await api.delete(`api/v1/${feature.id}/`);
      if (res.status === 204) {
        alert('Place deleted successfully');
        fetchPlaces();
        onClose();
        onClosePopup();
      } else {
        alert('Failed to delete place');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
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
            <div key={image.id || image.url}>
              <img
                src={image.url}
                width="50%"
                alt={image.caption || placeData.name}
              />
              <p>{image.caption}</p>
            </div>
          ))}
        {placeData.is_owner && (
          <div className="place-actions">
            {!showDeleteConfirm ? (
              <>
                <button onClick={handleEdit} className="edit-button">
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="delete-button"
                >
                  Delete
                </button>
              </>
            ) : (
              <div className="delete-confirm">
                <p>Are you sure you want to delete this place?</p>
                <button onClick={handleDelete} className="confirm-delete">
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="cancel-delete"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceDetails;
