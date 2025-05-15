import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Map from './components/Map';
import WelcomeOverlay from './components/WelcomeOverlay';
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

  const handleWelcomeClose = () => {
    setActiveOverlay(null);
  };

  const handleLoginSuccess = () => {
    setActiveOverlay(null);
  };

  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        userName={username}
        onLogout={logout}
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
