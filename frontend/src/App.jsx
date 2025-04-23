import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Posts from './pages/Posts';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} /> */}
            <Route path="/login" element={<Login />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/register" element={<RegisterAndLogout />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {/* TODO <Footer /> */}
      </div>
    </Router>
  );
}

export default App;
