import axios from 'axios';
import jwtDecode from 'jwt-decode';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const publicEndpoints = ['api/v1/geojson/'];

const isTokenValid = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (err) {
    console.log('isTokenValid check error in api.js', err);
    return false;
  }
};

api.interceptors.request.use(
  (config) => {
    const isPublic = publicEndpoints.some((endpoint) =>
      config.url.includes(endpoint)
    );
    const token = localStorage.getItem('access');
    if (token && isTokenValid(token) && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isPublic = publicEndpoints.some((endpoint) =>
      originalRequest.url.includes(endpoint)
    );
    if (error.response.status === 401 && !originalRequest._retry && !isPublic) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
            { refresh: refreshToken }
          );
          localStorage.setItem('access', data.access);
          originalRequest.headers.Authorication = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch (err) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('username');
          window.dispatchEvent(new Event('showLoginModal'));
          return Promise.reject(err);
        }
      } else {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('username');
        window.dispatchEvent(new Event('showLoginModal'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
