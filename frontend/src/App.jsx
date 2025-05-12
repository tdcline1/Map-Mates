import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Map from './components/Map';
import WelcomeOverlay from './components/WelcomeOverlay';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access')
  );
  const [userName, setUserName] = useState(
    localStorage.getItem('username') || 'Guest'
  );

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
    window.addEventListener('showLoginModal', handleShowLogin);
    return () => window.removeEventListener('showLoginModal', handleShowLogin);
  }, []);

  const handleWelcomeClose = () => {
    setActiveOverlay(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUserName('Guest');
  };

  const handleLoginSuccess = (username) => {
    setIsAuthenticated(true);
    setUserName(username);
    setActiveOverlay(null);
  };

  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        userName={userName}
        onLogout={handleLogout}
        onLoginClick={() => setActiveOverlay('login')}
        onRegisterClick={() => setActiveOverlay('register')}
      />
      <Map isAuthenticated={isAuthenticated} />

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
      {/* TODO <Footer /> */}
    </>
  );
}

export default App;
