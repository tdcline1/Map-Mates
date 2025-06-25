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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const nextImage = () => {
    if (placeData?.images && placeData.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === placeData.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (placeData?.images && placeData.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? placeData.images.length - 1 : prevIndex - 1
      );
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
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

        {/* Photo Carousel */}
        {placeData.images && placeData.images.length > 0 && (
          <div className="image-carousel">
            <div className="image-container">
              <div className="image-wrapper">
                <img
                  src={placeData.images[currentImageIndex].url}
                  alt={
                    placeData.images[currentImageIndex].caption ||
                    placeData.name
                  }
                  className="carousel-image"
                />

                {placeData.images.length > 1 && (
                  <>
                    <button
                      className="carousel-button carousel-button-prev"
                      onClick={prevImage}
                      aria-label="Previous Image"
                    >
                      &#8249;
                    </button>
                    <button
                      className="carousel-button carousel-button-next"
                      onClick={nextImage}
                      aria-label="Next image"
                    >
                      &#8250;
                    </button>
                  </>
                )}
              </div>

              {placeData.images[currentImageIndex].caption && (
                <p className="image-caption">
                  {placeData.images[currentImageIndex].caption}
                </p>
              )}

              {placeData.images.length > 1 && (
                <div className="carousel-dots">
                  {placeData.images.map((_, index) => (
                    <button
                      key={index}
                      className={`carousel-dot ${
                        index === currentImageIndex ? 'active' : ''
                      }`}
                      onClick={() => goToImage(index)}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {placeData.images.length > 1 && (
                <div className="image-counter">
                  {currentImageIndex + 1} / {placeData.images.length}
                </div>
              )}
            </div>
          </div>
        )}

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
