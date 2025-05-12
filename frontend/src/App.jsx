import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Places from './pages/Places';
import NotFound from './pages/NotFound';
import Map from './components/Map';
import PlaceDetails from './components/PlaceDetails';
// import ProtectedRoute from './components/ProtectedRoute';

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

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
    if (hasVisitedBefore) {
      setActiveOverlay('welcome');
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('userName');
    // Optional extras:
    // localStorage.removeItem('username');
    // localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserName('');
    navigate('/');
  };

  return (
    <>
      <Navbar
        isAuthenticated={isAuthenticated}
        userName={userName}
        onLogout={handleLogout}
      />
      <Map shouldBeVisible={isMapPathActive} />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} /> */}
          <Route
            path="/login"
            element={<Login setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="/place/:id" element={<PlaceDetails />} />
          <Route path="/places" element={<Places />} />
          <Route path="/register" element={<RegisterAndLogout />} />
          <Route path="/map" element={<div />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {/* TODO <Footer /> */}
    </>
  );
}

export default App;
