import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const isAuthRequest = (url = '') =>
  url.includes('/auth/login') ||
  url.includes('/auth/register') ||
  url.includes('/auth/google');

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authRequest = isAuthRequest(error.config?.url);

    if (error.response?.status === 401 && !authRequest) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
