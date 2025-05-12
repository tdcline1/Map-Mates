import '../styles/WelcomeOverlay.css';

function WelcomeOverlay({ onClose }) {
  <div className="overlay-container">
    <div className="overlay-content welcome-overlay">
      <h2>Welcome to MapMates!</h2>
      <p>
        This application allows you to explore and share interesting places
        around the world. Explore the map, add your own markers and discover new
        locations.
      </p>

      <div className="features-section">
        <h3>Feature:</h3>
        <ul>
          <li>Explore global locations</li>
          <li>Share your own favorite travel locations</li>
          <li>Comment on your friend's stories</li>
        </ul>
      </div>

      <div className="overlay-actions">
        <button className="btn btn-primary" onClick={onClose}>
          Get Started
        </button>
      </div>
    </div>
  </div>;
}

export default WelcomeOverlay;
