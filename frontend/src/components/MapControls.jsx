import '../styles/MapControls.css';

const MapControls = ({ map, onAddPin, isAuthenticated }) => {
  const flyToContinent = (long, lat, zoom) => {
    map.flyTo({ center: [long, lat], zoom: zoom });
  };

  const handleClick = () => {
    if (isAuthenticated) {
      onAddPin();
    } else {
      window.dispatchEvent(new Event('showLoginModal'));
    }
  };

  return (
    <>
      <div className="map-controls-group map-controls-top-left">
        <button
          className="map-control-button"
          onClick={() => {
            flyToContinent(18.1194, 50.5013, 3.4);
          }}
        >
          Fly to Europe
        </button>
        <button
          className="map-control-button"
          onClick={() => {
            flyToContinent(-97.98846, 35.1129, 3);
          }}
        >
          Fly to North America
        </button>
        <button
          className="map-control-button"
          onClick={() => {
            flyToContinent(-64.79085, -21.56653, 2.75);
          }}
        >
          Fly to South America
        </button>
        <button
          className="map-control-button"
          onClick={() => {
            flyToContinent(103.26131, 25.45753, 3);
          }}
        >
          Fly to Asia
        </button>
      </div>
      <div className="map-controls-group map-controls-top-right">
        <button className="map-control-button" onClick={handleClick}>
          Add a Place!{' '}
          {!isAuthenticated && <span className="lock-icon">🔒</span>}
        </button>
      </div>
    </>
  );
};

export default MapControls;
