import { useState } from 'react';
import api from '../api';
import '../styles/Form.css';
import LoadingIndicator from './LoadingIndicator';

function Form({ route, method, onSuccess, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const name = method === 'login' ? 'Login' : 'Register';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post(route, { username, password });
      if (method === 'login') {
        localStorage.setItem('access', res.data.access);
        localStorage.setItem('refresh', res.data.refresh);
        localStorage.setItem('username', username);
        onSuccess(username);
      } else {
        try {
          localStorage.clear();
          const loginRes = await api.post('/api/token/', {
            username,
            password,
          });
          localStorage.setItem('access', res.data.access);
          localStorage.setItem('refresh', res.data.refresh);
          localStorage.setItem('username', username);
          onSuccess(username);
        } catch (loginError) {
          onSuccess(username);
        }
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
