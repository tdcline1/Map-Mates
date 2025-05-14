import { jwtDecode } from 'jwt-decode';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access',
  REFRESH_TOKEN: 'refresh',
  USERNAME: 'username',
};

export const isTokenValid = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (err) {
    return false;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USERNAME);
};

export const checkAuthStatus = () => {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!accessToken || !isTokenValid(accessToken)) {
    clearAuthData();
    return {
      isAuthenticated: false,
      username: 'Guest',
    };
  }

  return {
    isAuthenticated: true,
    username: localStorage.getItem(STORAGE_KEYS.USERNAME),
  };
};
