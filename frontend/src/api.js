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

export default api;
