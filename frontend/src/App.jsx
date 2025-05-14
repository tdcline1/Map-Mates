import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Map from './components/Map';
import WelcomeOverlay from './components/WelcomeOverlay';
import { checkAuthStatus, clearAuthData } from './utils/auth';

function App() {
  const [authState, setAuthState] = useState(checkAuthStatus());
  const [activeOverlay, setActiveOverlay] = useState(null);

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      setActiveOverlay('welcome');
      localStorage.setItem('hasVisitedBefore', 'true');
    }

    const handleShowLogin = () => {
      setActiveOverlay('login');
    };

    const handleAuthStatusChanged = () => {
      setAuthState(checkAuthStatus());
    };

    window.addEventListener('showLoginModal', handleShowLogin);
    window.addEventListener('authStatusChanged', handleAuthStatusChanged);

    return () => {
      window.removeEventListener('showLoginModal', handleShowLogin);
      window.removeEventListener('authStatusChanged', handleAuthStatusChanged);
    };
  }, []);

  const handleWelcomeClose = () => {
    setActiveOverlay(null);
  };

  const handleLogout = () => {
    clearAuthData();
    setAuthState({ isAuthenticated: false, username: 'Guest' });
  };

  const handleLoginSuccess = (username) => {
    setAuthState({ isAuthenticated: true, username });
    setActiveOverlay(null);
  };

  return (
    <>
      <Navbar
        isAuthenticated={authState.isAuthenticated}
        userName={authState.username}
        onLogout={handleLogout}
        onLoginClick={() => setActiveOverlay('login')}
        onRegisterClick={() => setActiveOverlay('register')}
      />
      <Map isAuthenticated={authState.isAuthenticated} />

      {activeOverlay === 'welcome' && (
        <WelcomeOverlay onClose={handleWelcomeClose} />
      )}

      {activeOverlay === 'login' && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setActiveOverlay(null)}
          onRegisterClick={() => setActiveOverlay('register')}
        />
      )}

      {activeOverlay === 'register' && (
        <Register
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setActiveOverlay(null)}
          onLoginClick={() => setActiveOverlay('login')}
        />
      )}

      <main>
        <Routes>
          <Route path="/" element={<div />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
