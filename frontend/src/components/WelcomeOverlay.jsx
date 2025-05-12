import '../styles/WelcomeOverlay.css';

function WelcomeOverlay({ onClose }) {
  return (
    <div className="overlay-container">
      <div className="overlay-content welcome-overlay">
        <h2>🌍 Welcome to MapMates!</h2>
        <p>
          Embark on a journey to discover the community's favorite destinations,
          share your travel stories, and connect with other explorers. Pin your
          favorite spots and inspire others!
        </p>

        <div className="features-section">
          <h3>✨ Feature:</h3>
          <ul>
            <li>🌐 Explore global destinations marked by fellow travelers</li>
            <li>📍 Drop pins to capture your favorite locations and stories</li>
            <li>💬 Comment on and engage with friends' experiences</li>
          </ul>
        </div>

        <div className="overlay-actions">
          <button className="btn btn-primary" onClick={onClose}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeOverlay;
