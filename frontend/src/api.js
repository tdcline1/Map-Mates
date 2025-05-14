import axios from 'axios';
import { STORAGE_KEYS, clearAuthData, isTokenValid } from './utils/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const publicEndpoints = ['api/v1/geojson/'];

const isPublicEndpoint = (url) => {
  return publicEndpoints.some((endpoint) => url.includes(endpoint));
};

api.interceptors.request.use(
  (config) => {
    if (isPublicEndpoint(config.url)) {
      return config;
    }

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (token && isTokenValid(token)) {
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

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isPublicEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
            { refresh: refreshToken }
          );

          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch (err) {
          clearAuthData();
          window.dispatchEvent(new Event('authStatusChanged'));
          window.dispatchEvent(new Event('showLoginModal'));
          return Promise.reject(err);
        }
      } else {
        clearAuthData();
        window.dispatchEvent(new Event('authStatusChanged'));
        window.dispatchEvent(new Event('showLoginModal'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
