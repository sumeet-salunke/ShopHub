import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create central axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // required for refresh token cookie
});

// Create interceptor attached instance for protected routes
export const privateApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let requestInterceptorId = null;
let responseInterceptorId = null;

// We will inject the token getter and refresh logic in AuthContext to avoid circular dependency
// But we can set up the scaffold here.
export const setupInterceptors = (getAccessToken, setAccessToken, logout) => {
  if (requestInterceptorId !== null) {
    privateApi.interceptors.request.eject(requestInterceptorId);
  }
  if (responseInterceptorId !== null) {
    privateApi.interceptors.response.eject(responseInterceptorId);
  }

  requestInterceptorId = privateApi.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token && !config._retryAttempt) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  responseInterceptorId = privateApi.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If 401 and not already retried
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Attempt refresh
          const res = await api.post('/auth/refresh-token');
          const newAccessToken = res.data.accessToken;
          
          setAccessToken(newAccessToken);
          
          // Modify original request with new token
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          originalRequest._retryAttempt = true; // prevent infinite loops
          
          return privateApi(originalRequest);
        } catch (refreshErr) {
          // Refresh failed, user is actually logged out
          logout();
          return Promise.reject(refreshErr);
        }
      }
      
      return Promise.reject(error);
    }
  );
};
