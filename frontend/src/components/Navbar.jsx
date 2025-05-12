import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({
  isAuthenticated,
  userName,
  onLogout,
  onLoginClick,
  onRegisterClick,
}) => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-link">
          🥾MapMates
        </Link>
      </div>
      <div className="nav-right">
        <Link to="/map" className="nav-link">
          Map
        </Link>
        <Link to="/places" className="nav-link">
          Top Hikes
        </Link>
        <Link to="/top-cities" className="nav-link">
          Top Cities
        </Link>

        {isAuthenticated ? (
          <>
            <span className="auth-text">Hello, {userName}</span>
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="logout-button" onClick={onLoginClick}>
              Login
            </button>
            <button className="logout-button" onClick={onRegisterClick}>
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
