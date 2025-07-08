import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({
  isAuthenticated,
  userName,
  onLogout,
  onLoginClick,
  onRegisterClick,
  onTopUSHikesClick,
  onTopEuropeanHikesClick,
  onTopEuropeanCitiesClick,
}) => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-link">
          🥾MapMates
        </Link>
      </div>
      <div className="nav-right">
        <button className="top-places-button" onClick={onTopUSHikesClick}>
          Top US Hikes
        </button>
        <button className="top-places-button" onClick={onTopEuropeanHikesClick}>
          Top European Hikes
        </button>
        <button
          className="top-places-button"
          onClick={onTopEuropeanCitiesClick}
        >
          Top European Cities
        </button>

        {isAuthenticated ? (
          <>
            <span className="auth-text">Hello, {userName}</span>
            <button onClick={onLogout} className="top-places-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="top-places-button" onClick={onLoginClick}>
              Login
            </button>
            <button className="top-places-button" onClick={onRegisterClick}>
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
