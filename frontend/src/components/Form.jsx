import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Form.css';
import LoadingIndicator from './LoadingIndicator';

function Form({ route, method, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();

  const name = method === 'login' ? 'Login' : 'Register';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}${route}`,
        { username, password }
      );

      if (method === 'login') {
        const { access, refresh } = response.data;
        login(access, refresh, username);
        onClose();
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/token/`,
          { username, password }
        );
        const { access, refresh } = response.data;
        login(access, refresh, username);
        onClose();
      }
    } catch (error) {
      console.error(`${method} error:`, error);
      setError(
        error.response?.data?.detail || `${name} failed. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay-container">
      <div className="overlay-content">
        <button className="close-btn" onClick={onClose}>
          x
        </button>
        <form onSubmit={handleSubmit} className="form-container">
          <h1>{name}</h1>
          {error && <div className="error-message">{error}</div>}
          <input
            className="form-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          {loading && <LoadingIndicator />}
          <button className="form-button" type="submit">
            {name}
          </button>
          {method === 'login' ? (
            <p className="form-footer">
              Don't have an account?
              <button
                type="button"
                className="text-link"
                onClick={() => onClose('register')}
              >
                Register
              </button>
            </p>
          ) : (
            <p className="form-footer">
              Already have an accunt?
              <button
                type="button"
                className="text-link"
                onClick={() => onClose('login')}
              >
                Login
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Form;
