import '../styles/MapControls.css';

const MapControls = ({ map }) => {
  const flyToContinent = (long, lat, zoom) => {
    map.flyTo({ center: [long, lat], zoom: zoom });
  };

  return (
    <>
      <button
        className="reset-button"
        onClick={() => {
          flyToContinent(22.1194, 51.9013, 2.54);
        }}
      >
        Fly to Europe
      </button>
    </>
  );
};

export default MapControls;
