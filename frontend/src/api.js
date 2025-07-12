import axios from 'axios';

/**
 * Axios API Configuration
 *
 * Configures HTTP client with JWT authentication interceptors.
 * Handles automatic token attachment and refresh on 401 responses.
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const publicEndpoints = ['api/v1/geojson/'];

const isPublicEndpoint = (url) => {
  return publicEndpoints.some((endpoint) => url.includes(endpoint));
};

/**
 * Sets up request/response interceptors for JWT authentication
 * @param {Function} getAccessToken - Function to retrieve access token
 * @param {Function} logout - Function to handle user logout
 */
export const setupApiInterceptors = (getAccessToken, logout) => {
  // Request interceptor to add token header
  api.interceptors.request.use(
    async (config) => {
      if (isPublicEndpoint(config.url)) {
        return config;
      }

      const token = await getAccessToken();

      if (token) {
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
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !isPublicEndpoint(originalRequest.url)
      ) {
        originalRequest._retry = true;

        try {
          const token = await getAccessToken();

          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          } else {
            logout();
            window.dispatchEvent(new Event('showLoginModal'));
            return Promise.reject(error);
          }
        } catch (refreshError) {
          logout();
          window.dispatchEvent(new Event('showLoginModal'));
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};

export default api;
