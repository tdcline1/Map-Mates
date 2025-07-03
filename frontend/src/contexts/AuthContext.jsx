/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access',
  REFRESH_TOKEN: 'refresh',
  USERNAME: 'username',
};

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    username: 'Guest',
    isLoading: true,
  });

  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (err) {
      console.warn('Invalid token:', err.message);
      return false;
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refresh) {
      clearAuthData();
      setAuthState({
        isAuthenticated: false,
        username: 'Guest',
        isLoading: false,
      });
      return null;
    }
  };

  const getAccessToken = async () => {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (!accessToken) {
      return await refreshToken();
    }

    if (isTokenValid(accessToken)) {
      return accessToken;
    } else {
      return await refreshToken();
    }
  };

  const login = (access, refresh, username) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
    localStorage.setItem(STORAGE_KEYS.USERNAME, username);

    setAuthState({
      isAuthenticated: true,
      username,
      isLoading: false,
    });
  };

  const logout = () => {
    clearAuthData();
    setAuthState({
      isAuthenticated: false,
      username: 'Guest',
      isLoading: false,
    });
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await getAccessToken();

      if (token) {
        const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
        setAuthState({
          isAuthenticated: true,
          username,
          isLoading: false,
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          username: 'Guest',
          isLoading: false,
        });
      }
    };

    checkAuthStatus();

    const refreshInterval = setInterval(async () => {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (accessToken && isTokenValid(accessToken)) {
        const decoded = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;

        // Refresh token if it will expire in less than 4 minutes
        if (decoded.exp - currentTime < 240) {
          await refreshToken();
        }
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const value = {
    authState,
    isAuthenticated: authState.isAuthenticated,
    username: authState.username,
    isLoading: authState.isLoading,
    login,
    logout,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
