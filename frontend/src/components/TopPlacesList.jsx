import React, { useState, useEffect } from 'react';
import api from '../api';
import '../styles/TopPlacesList.css';

const TopPlacesList = ({ type, onClose }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getModalConfig = (type) => {
    switch (type) {
      case 'us-hikes':
        return {
          title: 'Top US Hikes',
          category: 'other',
        };
      case 'european-hikes':
        return {
          title: 'Top European Hikes',
          category: 'nature',
        };
      case 'european-cities':
        return {
          title: 'Top European Cities',
          category: 'city',
        };
      default:
        return {
          title: 'Top Places',
          category: null,
        };
    }
  };

  useEffect(() => {
    const fetchPlaces = () => {
      const config = getModalConfig(type);
      const url = `api/v1/geojson/?category=${config.category}`;

      setLoading(true);
      api
        .get(url)
        .then((res) => res.data)
        .then((data) => {
          setPlaces(data.features || []);
          setError(null);
        })
        .catch((err) => {
          setError('Error fetching places');
          console.error('Error fetching places:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchPlaces();
  }, [type]);

  const config = getModalConfig(type);

  return (
    <div className="modal-overlay">
      <div className="top-places-modal">
        <div className="modal-header">
          <h2>{config.title}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          {loading && <div className="loading">Loading places...</div>}

          {error && <div className="error">{error}</div>}

          {!loading && !error && (
            <div className="places-list">
              {places.map((place) => (
                <div
                  key={place.id}
                  className="place-tile"
                  onClick={() => {
                    // TODO: Add render place details functionality later
                    console.log('Place clicked:', place);
                  }}
                >
                  <div className="place-thumbnail">
                    {place.properties.thumbnail_url ? (
                      <img
                        src={place.properties.thumbnail_url}
                        alt={place.properties.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  <div className="place-info">
                    <h3 className="place-title">{place.properties.name}</h3>
                    <p className="place-subtitle">
                      {place.properties.subtitle}
                    </p>
                    <div className="place-rating">
                      ⭐ {place.properties.rating?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && places.length === 0 && (
            <div className="no-places">No places found for this category.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopPlacesList;
