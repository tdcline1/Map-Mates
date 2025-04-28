import React, { useState } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Link,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Places from './pages/Places';
import NotFound from './pages/NotFound';
import Map from './components/Map';
// import ProtectedRoute from './components/ProtectedRoute';

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access')
  );
  const [userName, setUserName] = useState('Thomas');
  const navigate = useNavigate();
  const location = useLocation();

  const mapPath = '/map';
  const isMapPathActive = location.pathname === mapPath;

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
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
          <Route path="/places" element={<Places />} />
          <Route path="/register" element={<RegisterAndLogout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {/* TODO <Footer /> */}
    </>
  );
}

export default App;
