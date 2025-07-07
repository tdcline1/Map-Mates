import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Map from './components/Map';
import WelcomeOverlay from './components/WelcomeOverlay';
import TopPlacesList from './components/TopPlacesList';
import { setupApiInterceptors } from './api';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const [activeOverlay, setActiveOverlay] = useState(null);
  const { isAuthenticated, username, logout, getAccessToken } = useAuth();

  useEffect(() => {
    setupApiInterceptors(getAccessToken, logout);
  }, [getAccessToken, logout]);

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

    return () => {
      window.removeEventListener('showLoginModal', handleShowLogin);
    };
  }, []);

  const handleCloseOverlay = useCallback(() => setActiveOverlay(null), []);
  const handleLoginClick = useCallback(() => setActiveOverlay('login'), []);
  const handleRegisterClick = useCallback(
    () => setActiveOverlay('register'),
    []
  );
  const handleTopUSHikesClick = useCallback(
    () => setActiveOverlay('us-hikes'),
    []
  );
  const handleTopEuropeanHikesClick = useCallback(
    () => setActiveOverlay('european-hikes'),
    []
  );
  const handleTopEuropeanCitiesClick = useCallback(
    () => setActiveOverlay('european-cities'),
    []
  );

  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        userName={username}
        onLogout={logout}
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
        onTopUSHikesClick={handleTopUSHikesClick}
        onTopEuropeanHikesClick={handleTopEuropeanHikesClick}
        onTopEuropeanCitiesClick={handleTopEuropeanCitiesClick}
      />
      <Map isAuthenticated={isAuthenticated} />

      {activeOverlay === 'welcome' && (
        <WelcomeOverlay onClose={handleCloseOverlay} />
      )}

      {activeOverlay === 'login' && (
        <Login
          onClose={handleCloseOverlay}
          onRegisterClick={handleRegisterClick}
        />
      )}

      {activeOverlay === 'register' && (
        <Register
          onClose={handleCloseOverlay}
          onLoginClick={handleLoginClick}
        />
      )}

      {activeOverlay == 'us-hikes' && (
        <TopPlacesList type="us-hikes" onClose={handleCloseOverlay} />
      )}
      {activeOverlay == 'european-hikes' && (
        <TopPlacesList type="european-hikes" onClose={handleCloseOverlay} />
      )}
      {activeOverlay === 'european-cities' && (
        <TopPlacesList type="european-cities" onClose={handleCloseOverlay} />
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
